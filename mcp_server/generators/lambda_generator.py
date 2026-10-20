"""ASK SDK Lambda Handler Generator (Node.js).

Generates production-ready `lambda/index.js` featuring:
- ASK SDK v2 Standard Architecture
- Session Management & Attributes handling
- DynamoDB Persistence Adapter integration
- Universal ErrorHandler
- SSML Audio formatting for natural speech synthesis
"""

from __future__ import annotations

import json
import logging
from typing import Any

from mcp_server.config.prompts.lambda_prompt import (
    LAMBDA_GENERATOR_SYSTEM_PROMPT,
    LAMBDA_GENERATOR_USER_TEMPLATE,
)
from mcp_server.services.bedrock_service import bedrock_service

logger = logging.getLogger("skillforge.lambda_generator")


class LambdaGenerator:
    def __init__(self):
        self.bedrock = bedrock_service

    def generate_lambda_handler(
        self,
        skill_name: str,
        description: str,
        interaction_model: dict[str, Any],
        include_dynamodb: bool = True,
    ) -> str:
        """Generate production ASK SDK Lambda handler with session & DynamoDB persistence."""
        im = interaction_model.get("interactionModel", interaction_model)
        lm = im.get("languageModel", {})
        intents = lm.get("intents", [])

        # 1. Attempt Bedrock generation if online
        user_prompt = LAMBDA_GENERATOR_USER_TEMPLATE.format(
            skill_name=skill_name,
            description=description,
            intents_json=json.dumps(intents, indent=2),
            include_dynamodb=include_dynamodb,
        )

        try:
            raw_code = self.bedrock.invoke_with_retry(
                system_prompt=LAMBDA_GENERATOR_SYSTEM_PROMPT,
                user_prompt=user_prompt,
                max_tokens=4000,
            )
            if raw_code and "Alexa.SkillBuilders" in raw_code and "ErrorHandler" in raw_code:
                # Strip any accidental markdown formatting
                cleaned = raw_code.strip()
                if cleaned.startswith("```javascript") or cleaned.startswith("```js"):
                    cleaned = cleaned.split("\n", 1)[1]
                if cleaned.endswith("```"):
                    cleaned = cleaned.rsplit("```", 1)[0]
                return cleaned.strip()
        except Exception as e:
            logger.info(f"Bedrock online Lambda generation bypassed: {e}. Generating clean reference handler.")

        # 2. Resilient Template Generator (Production-ready ASK SDK v2 implementation)
        return self._generate_template_lambda(skill_name, description, intents, include_dynamodb)

    def _generate_template_lambda(
        self,
        skill_name: str,
        description: str,
        intents: list[dict[str, Any]],
        include_dynamodb: bool = True,
    ) -> str:
        custom_intents = [i for i in intents if not i.get("name", "").startswith("AMAZON.")]

        # Build custom intent handlers
        custom_handlers_code = []
        handler_names = ["LaunchRequestHandler"]

        for ci in custom_intents:
            iname = ci.get("name", "CustomIntent")
            hname = f"{iname}Handler"
            handler_names.append(hname)

            slots = ci.get("slots", [])
            slot_extraction = ""
            for s in slots:
                sname = s.get("name", "val")
                slot_extraction += f"""
        const {sname} = Alexa.getSlotValue(handlerInput.requestEnvelope, '{sname}');"""

            code = f"""
const {hname} = {{
    canHandle(handlerInput) {{
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === '{iname}';
    }},
    async handle(handlerInput) {{
        const {{ attributesManager }} = handlerInput;{slot_extraction}

        // Session Management: Retrieve & update session attributes
        const sessionAttributes = attributesManager.getSessionAttributes() || {{}};
        const currentCount = (sessionAttributes.actionCount || 0) + 1;
        sessionAttributes.actionCount = currentCount;
        attributesManager.setSessionAttributes(sessionAttributes);

        // Persistent DynamoDB Storage
        if (attributesManager.getPersistentAttributes) {{
            const persistentAttributes = await attributesManager.getPersistentAttributes() || {{}};
            persistentAttributes.lastInteraction = new Date().toISOString();
            persistentAttributes.totalInteractions = (persistentAttributes.totalInteractions || 0) + 1;
            attributesManager.setPersistentAttributes(persistentAttributes);
            await attributesManager.savePersistentAttributes();
        }}

        const speakOutput = `<speak>
            <prosody rate="100%">Got it. Your action has been successfully recorded in {skill_name}.</prosody>
            <break time="300ms"/>
            You have completed ${{currentCount}} sessions today. What would you like to do next?
        </speak>`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('What else would you like to log or check?')
            .getResponse();
    }}
}};
"""
            custom_handlers_code.append(code)

        handlers_block = "\n".join(custom_handlers_code)
        all_handler_names = ", ".join(handler_names + [
            "HelpIntentHandler",
            "CancelAndStopIntentHandler",
            "FallbackIntentHandler",
            "SessionEndedRequestHandler",
            "IntentReflectorHandler",
        ])

        persistence_setup = ""
        persistence_adapter = ""
        if include_dynamodb:
            persistence_setup = """
const { DynamoDbPersistenceAdapter } = require('ask-sdk-dynamodb-persistence-adapter');
const persistenceAdapter = new DynamoDbPersistenceAdapter({
    tableName: process.env.DYNAMODB_PERSISTENCE_TABLE_NAME || 'SkillForge_UserSessions',
    createTable: true,
});
"""
            persistence_adapter = ".withPersistenceAdapter(persistenceAdapter)"

        lambda_code = f"""/**
 * SkillForge Generated Alexa Skill Lambda Handler
 * Skill: {skill_name}
 * Description: {description}
 * Runtime: Node.js 18.x | ASK SDK v2
 */

const Alexa = require('ask-sdk-core');
{persistence_setup}

const LaunchRequestHandler = {{
    canHandle(handlerInput) {{
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    }},
    async handle(handlerInput) {{
        const {{ attributesManager }} = handlerInput;
        const sessionAttributes = attributesManager.getSessionAttributes() || {{}};
        sessionAttributes.sessionStartedAt = new Date().toISOString();
        attributesManager.setSessionAttributes(sessionAttributes);

        const speakOutput = `<speak>
            Welcome to {skill_name}!
            <break time="300ms"/>
            I am ready to assist you. You can ask me to log an entry or check your daily status.
        </speak>`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('What would you like to do?')
            .getResponse();
    }}
}};
{handlers_block}
const HelpIntentHandler = {{
    canHandle(handlerInput) {{
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    }},
    handle(handlerInput) {{
        const speakOutput = '<speak>You can ask me to record a new entry, check your daily progress, or set a reminder. How can I help?</speak>';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }}
}};

const CancelAndStopIntentHandler = {{
    canHandle(handlerInput) {{
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    }},
    handle(handlerInput) {{
        const speakOutput = '<speak>Goodbye! Stay consistent and see you soon.</speak>';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }}
}};

const FallbackIntentHandler = {{
    canHandle(handlerInput) {{
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    }},
    handle(handlerInput) {{
        const speakOutput = '<speak>Sorry, I did not catch that. Please say your request again or ask for help.</speak>';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('How can I help you?')
            .getResponse();
    }}
}};

const SessionEndedRequestHandler = {{
    canHandle(handlerInput) {{
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    }},
    handle(handlerInput) {{
        console.log(`Session ended with reason: ${{handlerInput.requestEnvelope.request.reason}}`);
        return handlerInput.responseBuilder.getResponse();
    }}
}};

const IntentReflectorHandler = {{
    canHandle(handlerInput) {{
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    }},
    handle(handlerInput) {{
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `<speak>You just triggered ${{intentName}}.</speak>`;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }}
}};

/**
 * Universal Error Handler
 * Resolves FP #4: structured error envelope & speech fallback
 */
const ErrorHandler = {{
    canHandle() {{
        return true;
    }},
    handle(handlerInput, error) {{
        console.error(`~~~~ Error handled: ${{JSON.stringify(error)}}`);
        const speakOutput = '<speak>Sorry, I had trouble doing what you asked. Please try again.</speak>';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }}
}};

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        {all_handler_names}
    )
    .addErrorHandlers(ErrorHandler)
    {persistence_adapter}
    .lambda();
"""
        return lambda_code.strip()


# Global instance
lambda_generator = LambdaGenerator()
