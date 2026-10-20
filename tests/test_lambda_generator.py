"""Unit tests for Lambda Generator."""

from mcp_server.generators.intent_generator import intent_generator
from mcp_server.generators.lambda_generator import lambda_generator


def _get_sample_interaction_model():
    return intent_generator.generate_interaction_model(
        description="Build a skill that tracks my daily water intake",
        skill_name="Hydration Tracker",
    )


def test_lambda_includes_session_management():
    """Verify generated Lambda code integrates session management attributes."""
    model = _get_sample_interaction_model()
    code = lambda_generator.generate_lambda_handler(
        skill_name="Hydration Tracker",
        description="Track daily water",
        interaction_model=model,
        include_dynamodb=True,
    )

    assert "attributesManager.getSessionAttributes()" in code
    assert "attributesManager.setSessionAttributes(" in code
    assert "LaunchRequestHandler" in code


def test_dynamodb_persistence_code_generated():
    """Verify generated Lambda code integrates DynamoDbPersistenceAdapter."""
    model = _get_sample_interaction_model()
    code = lambda_generator.generate_lambda_handler(
        skill_name="Hydration Tracker",
        description="Track daily water",
        interaction_model=model,
        include_dynamodb=True,
    )

    assert "DynamoDbPersistenceAdapter" in code
    assert "withPersistenceAdapter(persistenceAdapter)" in code
    assert "attributesManager.savePersistentAttributes()" in code


def test_error_handler_included():
    """Verify generated Lambda code contains an error handler that handles any uncaught exception."""
    model = _get_sample_interaction_model()
    code = lambda_generator.generate_lambda_handler(
        skill_name="Hydration Tracker",
        description="Track daily water",
        interaction_model=model,
        include_dynamodb=False,
    )

    assert "const ErrorHandler =" in code
    assert "canHandle()" in code or "canHandle(handlerInput)" in code
    assert "addErrorHandlers(ErrorHandler)" in code
