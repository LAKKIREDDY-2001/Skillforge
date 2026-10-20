"""Unit tests for Intent Generator."""

from mcp_server.generators.intent_generator import intent_generator


def test_simple_skill_generates_correct_intents():
    """Verify that describing a skill generates domain-relevant custom intents and built-ins."""
    model = intent_generator.generate_interaction_model(
        description="Build a skill that tracks my daily water intake and reminds me to drink",
        skill_name="Hydration Tracker",
        invocation_name="water tracker",
    )
    im = model.get("interactionModel", model)
    lm = im.get("languageModel", {})
    intents = lm.get("intents", [])
    intent_names = [i["name"] for i in intents]

    assert "LogWaterIntent" in intent_names
    assert "CheckDailyIntakeIntent" in intent_names
    assert "AMAZON.HelpIntent" in intent_names
    assert "AMAZON.StopIntent" in intent_names
    assert "AMAZON.CancelIntent" in intent_names


def test_multi_turn_dialog_generates_delegation():
    """Verify that multi-turn dialog models specify ALWAYS delegation strategy."""
    model = intent_generator.generate_interaction_model(
        description="Build a workout logger that records activity and duration",
        multi_turn=True,
    )
    im = model.get("interactionModel", model)
    dialog = im.get("dialog")

    assert dialog is not None
    assert dialog.get("delegationStrategy") == "ALWAYS"
    dialog_intents = dialog.get("intents", [])
    assert len(dialog_intents) >= 1
    assert dialog_intents[0].get("delegationStrategy") == "ALWAYS"


def test_custom_slot_types_generated_correctly():
    """Verify that custom slot types contain expected names, values, and synonyms."""
    model = intent_generator.generate_interaction_model(
        description="Track my daily water intake in milliliters or ounces",
    )
    im = model.get("interactionModel", model)
    lm = im.get("languageModel", {})
    types = lm.get("types", [])

    assert len(types) >= 1
    slot_type = types[0]
    assert "name" in slot_type
    values = slot_type.get("values", [])
    assert len(values) >= 2

    # Check synonym presence
    has_synonyms = any(len(v.get("name", {}).get("synonyms", [])) > 0 for v in values)
    assert has_synonyms


def test_utterance_count_minimum_10_per_intent():
    """Verify that every custom intent contains at least 10 sample utterances for robust NLU."""
    model = intent_generator.generate_interaction_model(
        description="Build a fitness tracker for running and cycling",
    )
    im = model.get("interactionModel", model)
    lm = im.get("languageModel", {})
    intents = lm.get("intents", [])

    custom_intents = [i for i in intents if not i.get("name", "").startswith("AMAZON.")]
    assert len(custom_intents) >= 2

    for ci in custom_intents:
        samples = ci.get("samples", [])
        assert len(samples) >= 10, f"Intent {ci.get('name')} had only {len(samples)} utterances (minimum 10 required)"
