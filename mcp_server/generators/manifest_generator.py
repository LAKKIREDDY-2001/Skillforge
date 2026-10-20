"""Alexa Skill Manifest (`skill.json`) Generator."""

from __future__ import annotations

from typing import Any, Optional


class ManifestGenerator:
    def generate_manifest(
        self,
        skill_name: str,
        description: str,
        locale: str = "en-US",
        lambda_arn: Optional[str] = None,
    ) -> dict[str, Any]:
        """Generate compliant Alexa skill.json manifest."""
        arn = lambda_arn or "arn:aws:lambda:us-east-1:123456789012:function:SkillForge-Handler"

        return {
            "manifest": {
                "manifestVersion": "1.0",
                "publishingInformation": {
                    "locales": {
                        locale: {
                            "name": skill_name,
                            "summary": f"AI-Powered voice experience for {skill_name}.",
                            "description": description,
                            "smallIconUri": "https://s3.amazonaws.com/skillforge-assets/icon_108.png",
                            "largeIconUri": "https://s3.amazonaws.com/skillforge-assets/icon_512.png",
                            "examplePhrases": [
                                f"Alexa, open {skill_name.lower()}",
                                f"Alexa, ask {skill_name.lower()} to log an entry",
                                f"Alexa, ask {skill_name.lower()} for my status",
                            ],
                            "keywords": [
                                "skillforge",
                                "alexa+",
                                "ai assistant",
                                "voice productivity",
                                "amazon bedrock",
                            ],
                        }
                    },
                    "isAvailableWorldwide": True,
                    "testingInstructions": "Say 'Alexa, open skill' to begin the interactive voice flow.",
                    "category": "ORGANIZERS_AND_ASSISTANTS",
                    "distributionCountries": [],
                },
                "apis": {
                    "custom": {
                        "endpoint": {
                            "uri": arn,
                        },
                        "interfaces": [
                            {
                                "type": "ALEXA_PRESENTATION_APL",
                            }
                        ],
                    }
                },
                "permissions": [
                    {
                        "name": "alexa::profile:name:read",
                    }
                ],
                "privacyAndCompliance": {
                    "allowsPurchases": False,
                    "usesPersonalInfo": False,
                    "isChildDirected": False,
                    "isExportCompliant": True,
                    "containsAds": False,
                    "certifyToCompliance": True,
                    "locales": {
                        locale: {
                            "privacyPolicyUrl": "https://skillforge.io/privacy",
                            "termsOfUseUrl": "https://skillforge.io/terms",
                        }
                    },
                },
            }
        }


# Global instance
manifest_generator = ManifestGenerator()
