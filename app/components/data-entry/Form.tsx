"use client";

import { useId, useState, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Icon } from "../../icons/Icon";
import { Alert } from "../feedback/Alert";
import { Button } from "../general/Button";
import { Checkbox } from "./Checkbox";
import { Input } from "./Input";
import { Radio } from "./Radio";
import { Select } from "./Select";
import { Toggle } from "./Toggle";

/* ═══════════════════════════════════════════════════════════
   LABEL: "Title ⓘ *"
   ═══════════════════════════════════════════════════════════ */

export interface LabelProps {
  /** Defaults to "Title" */
  children?: ReactNode;
  /** Red star: the field is required */
  required?: boolean;
  /** Help icon after the text. A string shows on hover and is read by screen readers */
  help?: string | boolean;
  align?: "left" | "right";
  /** Id of the field this label names (clicking the label focuses it) */
  htmlFor?: string;
  /** Id of the label itself (to name a group with aria-labelledby) */
  id?: string;
  /** "label" (default) or "span" for a group title (checkboxes, radios) */
  as?: "label" | "span";
  disabled?: boolean;
  className?: string;
}

export function Label({ children = "Title", required, help, align = "left", htmlFor, id, as = "label", disabled, className }: LabelProps) {
  const Tag = as;

  return (
    <Tag
      id={id}
      htmlFor={as === "label" ? htmlFor : undefined}
      className={cn(
        // 4px between text, help icon and star | Regular/Body
        "flex w-full items-center gap-1 text-body font-normal",
        align === "right" ? "justify-end" : "justify-start",
        disabled ? "text-neutral-400" : "text-neutral-600",
        className
      )}
    >
      {children}
      {help && (
        <span title={typeof help === "string" ? help : undefined} className="flex items-center">
          <Icon name="help" size={14} label={typeof help === "string" ? help : "Help"} className={disabled ? "text-neutral-400" : "text-neutral-500"} />
        </span>
      )}
      {required && <span aria-hidden="true" className="text-danger-600">*</span>}
    </Tag>
  );
}

// Demo width, so the alignment shows
const demo = "w-[240px]";

/** Label above the field, left-aligned */
export const LabelAlignTopLeft = ({ className, help = true, required = true, ...props }: LabelProps) => (
  <Label align="left" help={help} required={required} className={cn(demo, className)} {...props} />
);

/** Label above the field, right-aligned */
export const LabelAlignTopRight = ({ className, help = true, required = true, ...props }: LabelProps) => (
  <Label align="right" help={help} required={required} className={cn(demo, className)} {...props} />
);

/* ═══════════════════════════════════════════════════════════
   FORM: the Figma sample form
   ═══════════════════════════════════════════════════════════ */

export interface FormValues {
  input1: string;
  input2: string;
  country: string;
  securityUpdates: boolean;
  accountInfo: boolean;
  contact: string;
  notifications: boolean;
}

export interface FormProps {
  defaultValues?: Partial<FormValues>;
  onSave?: (values: FormValues) => void;
  onDiscard?: () => void;
  className?: string;
}

const countries = [
  { value: "china", label: "China" },
  { value: "france", label: "France" },
  { value: "canada", label: "Canada" },
  { value: "morocco", label: "Morocco" },
];

const contacts = [
  { value: "email", label: "Email" },
  { value: "text", label: "Text message" },
];

// A label, 8px, then the content
const Field = ({ children, className, ...props }: { children: ReactNode; className?: string; role?: string; "aria-labelledby"?: string }) => (
  <div className={cn("flex flex-col gap-2", className)} {...props}>
    {children}
  </div>
);

// Section title (Medium/Body) and description (Regular/Body)
const Section = ({ title, children }: { title: string; children?: ReactNode }) => (
  <div className="flex flex-col gap-1">
    <h3 className="text-body font-medium text-neutral-700">{title}</h3>
    {children && <p className="text-body text-neutral-500">{children}</p>}
  </div>
);

export function Form({ defaultValues, onSave, onDiscard, className }: FormProps) {
  const [v, setV] = useState<FormValues>({
    input1: "",
    input2: "",
    country: "china",
    securityUpdates: true,
    accountInfo: true,
    contact: "text",
    notifications: true,
    ...defaultValues,
  });
  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => setV((p) => ({ ...p, [key]: value }));

  // Unique ids to link each label to its field
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave?.(v);
      }}
      className={cn("flex w-[400px] max-w-full flex-col", className)}
    >
      <Alert className="w-full" />

      {/* Title (Medium/Subtitle) and description, 32 below the alert */}
      <div className="mt-8 flex flex-col gap-1">
        <h2 className="text-subtitle font-medium text-neutral-700">Form title</h2>
        <p className="text-body text-neutral-500">Optional description. This sample uses common UI elements.</p>
      </div>

      <div className="mt-6">
        <Section title="Section 1">Here&apos;s an example of how a section can be used to group inputs.</Section>
      </div>

      {/* Two fields side by side, 16 apart */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <Field>
          <Label help required htmlFor={id("input1")}>
            Input with label 1
          </Label>
          <Input id={id("input1")} name="input1" required className="w-full" size="md" value={v.input1} onChange={(t) => set("input1", t)} placeholder="Text input" />
        </Field>
        <Field>
          <Label htmlFor={id("input2")}>Input with label 2</Label>
          <Input id={id("input2")} name="input2" className="w-full" size="md" value={v.input2} onChange={(t) => set("input2", t)} placeholder="Text input" />
        </Field>
      </div>

      <Field className="mt-8">
        <Label required htmlFor={id("country")}>
          Dropdown with label
        </Label>
        <Select id={id("country")} name="country" className="w-full" size="md" options={countries} value={v.country} onChange={(c) => set("country", c)} />
      </Field>

      <div className="mt-8">
        <Section title="Section 2" />
      </div>

      {/* Checkbox group, 8 between the boxes */}
      <Field className="mt-6" role="group" aria-labelledby={id("checks")}>
        <Label as="span" id={id("checks")} help>
          Checkbox label
        </Label>
        <Checkbox name="securityUpdates" checked={v.securityUpdates} onChange={(c) => set("securityUpdates", c)}>
          Security updates
        </Checkbox>
        <Checkbox name="accountInfo" checked={v.accountInfo} onChange={(c) => set("accountInfo", c)}>
          Account related information
        </Checkbox>
      </Field>

      {/* Radio group: one choice at a time */}
      <Field className="mt-8" role="radiogroup" aria-labelledby={id("contact")}>
        <Label as="span" id={id("contact")}>
          Radio label
        </Label>
        <div className="flex flex-col gap-2">
          {contacts.map((c) => (
            <Radio key={c.value} name="contact" value={c.value} checked={v.contact === c.value} onChange={() => set("contact", c.value)}>
              {c.label}
            </Radio>
          ))}
        </div>
      </Field>

      <Field className="mt-8">
        <Label htmlFor={id("notifications")}>Switch label</Label>
        <Toggle id={id("notifications")} label="Switch label" checked={v.notifications} onChange={(c) => set("notifications", c)} />
      </Field>

      {/* Discard (ghost) and Save (primary), right-aligned */}
      <div className="mt-8 flex items-center justify-end gap-2">
        <Button variant="ghost" size="md" onClick={onDiscard}>
          Discard
        </Button>
        <Button variant="primary" size="md" type="submit" className="w-[92px]">
          Save
        </Button>
      </div>
    </form>
  );
}
