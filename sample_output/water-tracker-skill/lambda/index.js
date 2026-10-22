/**
 * SkillForge Generated Alexa Skill Lambda Handler
 * Skill: water tracker
 * Description: Build an Alexa skill that tracks daily water intake, logs glasses of water consumed, and provides a daily progress summary.
 * Runtime: Node.js 18.x | ASK SDK v2
 */

const Alexa = require('ask-sdk-core');

const { DynamoDbPersistenceAdapter } = require('ask-sdk-dynamodb-persistence-adapter');
const persistenceAdapter = new DynamoDbPersistenceAdapter({
    tableName: process.env.DYNAMODB_PERSISTENCE_TABLE_NAME || 'SkillForge_UserSessions',
    createTable: true,
});


const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    async handle(handlerInput) {
        const { attributesManager } = handlerInput;
        const sessionAttributes = attributesManager.getSessionAttributes() || {};
        sessionAttributes.sessionStartedAt = new Date().toISOString();
        attributesManager.setSessionAttributes(sessionAttributes);

        const speakOutput = `<speak>
            Welcome to water tracker!
            <break time="300ms"/>
            I am ready to assist you. You can ask me to log an entry or check your daily status.
        </speak>`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('What would you like to do?')
            .getResponse();
    }
};

const LogWaterIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'LogWaterIntent';
    },
    async handle(handlerInput) {
        const { attributesManager } = handlerInput;
        const amount = Alexa.getSlotValue(handlerInput.requestEnvelope, 'amount');
        const unit = Alexa.getSlotValue(handlerInput.requestEnvelope, 'unit');

        // Session Management: Retrieve & update session attributes
        const sessionAttributes = attributesManager.getSessionAttributes() || {};
        const currentCount = (sessionAttributes.actionCount || 0) + 1;
        sessionAttributes.actionCount = currentCount;
        attributesManager.setSessionAttributes(sessionAttributes);

        // Persistent DynamoDB Storage
        if (attributesManager.getPersistentAttributes) {
            const persistentAttributes = await attributesManager.getPersistentAttributes() || {};
            persistentAttributes.lastInteraction = new Date().toISOString();
            persistentAttributes.totalInteractions = (persistentAttributes.totalInteractions || 0) + 1;
            attributesManager.setPersistentAttributes(persistentAttributes);
            await attributesManager.savePersistentAttributes();
        }

        const speakOutput = `<speak>
            <prosody rate="100%">Got it. Your action has been successfully recorded in water tracker.</prosody>
            <break time="300ms"/>
            You have completed ${currentCount} sessions today. What would you like to do next?
        </speak>`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('What else would you like to log or check?')
            .getResponse();
    }
};


const CheckDailyIntakeIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CheckDailyIntakeIntent';
    },
    async handle(handlerInput) {
        const { attributesManager } = handlerInput;

        // Session Management: Retrieve & update session attributes
        const sessionAttributes = attributesManager.getSessionAttributes() || {};
        const currentCount = (sessionAttributes.actionCount || 0) + 1;
        sessionAttributes.actionCount = currentCount;
        attributesManager.setSessionAttributes(sessionAttributes);

        // Persistent DynamoDB Storage
        if (attributesManager.getPersistentAttributes) {
            const persistentAttributes = await attributesManager.getPersistentAttributes() || {};
            persistentAttributes.lastInteraction = new Date().toISOString();
            persistentAttributes.totalInteractions = (persistentAttributes.totalInteractions || 0) + 1;
            attributesManager.setPersistentAttributes(persistentAttributes);
            await attributesManager.savePersistentAttributes();
        }

        const speakOutput = `<speak>
            <prosody rate="100%">Got it. Your action has been successfully recorded in water tracker.</prosody>
            <break time="300ms"/>
            You have completed ${currentCount} sessions today. What would you like to do next?
        </speak>`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('What else would you like to log or check?')
            .getResponse();
    }
};


const SetReminderIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SetReminderIntent';
    },
    async handle(handlerInput) {
        const { attributesManager } = handlerInput;
        const interval = Alexa.getSlotValue(handlerInput.requestEnvelope, 'interval');

        // Session Management: Retrieve & update session attributes
        const sessionAttributes = attributesManager.getSessionAttributes() || {};
        const currentCount = (sessionAttributes.actionCount || 0) + 1;
        sessionAttributes.actionCount = currentCount;
        attributesManager.setSessionAttributes(sessionAttributes);

        // Persistent DynamoDB Storage
        if (attributesManager.getPersistentAttributes) {
            const persistentAttributes = await attributesManager.getPersistentAttributes() || {};
            persistentAttributes.lastInteraction = new Date().toISOString();
            persistentAttributes.totalInteractions = (persistentAttributes.totalInteractions || 0) + 1;
            attributesManager.setPersistentAttributes(persistentAttributes);
            await attributesManager.savePersistentAttributes();
        }

        const speakOutput = `<speak>
            <prosody rate="100%">Got it. Your action has been successfully recorded in water tracker.</prosody>
            <break time="300ms"/>
            You have completed ${currentCount} sessions today. What would you like to do next?
        </speak>`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('What else would you like to log or check?')
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = '<speak>You can ask me to record a new entry, check your daily progress, or set a reminder. How can I help?</speak>';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = '<speak>Goodbye! Stay consistent and see you soon.</speak>';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = '<speak>Sorry, I did not catch that. Please say your request again or ask for help.</speak>';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('How can I help you?')
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
        return handlerInput.responseBuilder.getResponse();
    }
};

const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `<speak>You just triggered ${intentName}.</speak>`;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

/**
 * Universal Error Handler
 * Resolves FP #4: structured error envelope & speech fallback
 */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.error(`~~~~ Error handled: ${JSON.stringify(error)}`);
        const speakOutput = '<speak>Sorry, I had trouble doing what you asked. Please try again.</speak>';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler, LogWaterIntentHandler, CheckDailyIntakeIntentHandler, SetReminderIntentHandler, HelpIntentHandler, CancelAndStopIntentHandler, FallbackIntentHandler, SessionEndedRequestHandler, IntentReflectorHandler
    )
    .addErrorHandlers(ErrorHandler)
    .withPersistenceAdapter(persistenceAdapter)
    .lambda();