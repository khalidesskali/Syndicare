export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "email"
  | "date"
  | "time"
  | "select"
  | "checkbox"
  | "currency";

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: FieldOption[];
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | null;
  };
}

export interface ActionModalConfig {
  title: string;
  description?: string;
  fields: FieldConfig[];
  submitButtonText: string;
  submitButtonVariant?: "default" | "destructive" | "outline" | "secondary";
  action: (data: Record<string, any>) => Promise<boolean>;
  initialData?: Record<string, any>;
}

export interface DeleteModalConfig {
  title: string;
  description: string;
  itemName: string;
  confirmText?: string;
  action: () => Promise<boolean>;
}
