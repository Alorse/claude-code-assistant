export interface ModelConfig {
  value: string;
  label: string;
  description: string;
}

export const AVAILABLE_MODELS: ModelConfig[] = [
  {
    value: "default",
    label: "Default (recommended)",
    description: "Use the default model (currently Sonnet 4) · $3/$15 per Mtok",
  },
  {
    value: "opus",
    label: "Opus",
    description: "Opus 4.1 for complex tasks · $15/$75 per Mtok",
  },
  {
    value: "opus-plan",
    label: "Opus Plan Mode",
    description: "Use Opus 4.1 in plan mode, Sonnet 4 otherwise",
  },
];

export const getModelByValue = (value: string): ModelConfig | undefined => {
  return AVAILABLE_MODELS.find((model) => model.value === value);
};

export const getValidModelValues = (): string[] => {
  return AVAILABLE_MODELS.map((model) => model.value);
};
