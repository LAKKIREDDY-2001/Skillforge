"""Unit tests for Skill Validator & Schema Compliance."""

from mcp_server.generators.intent_generator import intent_generator
from mcp_server.services.ask_cli_service import ask_cli_service


def test_interaction_model_schema_valid():
    """Verify that generated interaction models satisfy Alexa interaction model specifications."""
    model = intent_generator.generate_interaction_model(
        description="Build a daily habit tracker that logs tasks",
        skill_name="Habit Forge",
        invocation_name="habit forge",
    )
    package = {
        "skill_id": "test_skill_1",
        "name": "Habit Forge",
        "manifest": {"manifestVersion": "1.0"},
        "interaction_model": model,
        "lambda_handler": "const ErrorHandler = {};",
    }

    is_valid, errors = ask_cli_service.validate_package_before_deploy(package)
    assert is_valid, f"Validation failed with errors: {errors}"
    assert len(errors) == 0


def test_no_duplicate_utterances():
    """Verify that interaction model contains no duplicate sample utterances within and across intents."""
    model = intent_generator.generate_interaction_model(
        description="Build a water tracker",
        skill_name="Water Tracker",
        invocation_name="water tracker",
    )
    im = model.get("interactionModel", model)
    lm = im.get("languageModel", {})
    intents = lm.get("intents", [])

    all_utterances = []
    for intent in intents:
        samples = intent.get("samples", [])
        for sample in samples:
            clean = sample.lower().strip()
            all_utterances.append(clean)

    duplicates = [u for u in all_utterances if all_utterances.count(u) > 1]
    assert len(duplicates) == 0, f"Found duplicate utterances: {set(duplicates)}"


def test_required_intents_present():
    """Verify mandatory Amazon intents are always present (AMAZON.HelpIntent, AMAZON.StopIntent, etc.)."""
    model = intent_generator.generate_interaction_model(
        description="Any custom skill idea",
    )
    im = model.get("interactionModel", model)
    lm = im.get("languageModel", {})
    intent_names = [i["name"] for i in lm.get("intents", [])]

    mandatory = [
        "AMAZON.HelpIntent",
        "AMAZON.StopIntent",
        "AMAZON.CancelIntent",
        "AMAZON.FallbackIntent",
        "AMAZON.NavigateHomeIntent",
    ]
    for m in mandatory:
        assert m in intent_names, f"Mandatory intent {m} was missing from interaction model"
