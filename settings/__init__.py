DEBUG = True

MODULES = [
        "users",
        "programs",
        ]

MODELS = [
        ("users.models", "User"),
        ("programs.models", "Program"),
        ("programs.models", "Trigger"),
        ("programs.models", "Event"),
        ("programs.models", "Condition"),
        ("programs.models", "Loop"),
        ("programs.models", "Block"),
        ("programs.models", "Link"),
        ("programs.models", "ConditionLink"),
        ]

SECRET_KEY = "secret"
