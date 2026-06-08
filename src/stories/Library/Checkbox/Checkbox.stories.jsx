/**
 * Checkbox — Storybook stories
 *
 * Imports the shared React component from components/checkbox/checkbox.jsx.
 * Source of truth for all Checkbox rendering is that module.
 *
 * Spec:  components/checkbox/checkbox-spec.md
 * Figma: https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40002324-54532
 */

import React, { useState } from "react";
import { Checkbox } from "../../../../components/checkbox/checkbox.jsx";

// ─── Storybook metadata ──────────────────────────────────────────────────────
export default {
  title: "Library/Checkbox",
  component: Checkbox,
  argTypes: {
    checked:       { control: "boolean" },
    indeterminate: { control: "boolean" },
    error:         { control: "boolean" },
    highlight:     { control: "boolean" },
    secondary:     { control: "boolean" },
    disabled:      { control: "boolean" },
    size:          { control: { type: "select" }, options: ["default", "s"] },
    label:         { control: "text" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Multi-select selection control. Supports unchecked, checked, and indeterminate " +
          "states with error, highlight, and secondary indeterminate variants. " +
          "Figma node `40002324:54532`. See `components/checkbox/checkbox-spec.md` for the full spec.",
      },
    },
  },
};

// ─── Wrapper for stateful stories ────────────────────────────────────────────
function Controlled(args) {
  const [checked, setChecked] = useState(args.checked ?? false);
  return (
    <Checkbox
      {...args}
      checked={checked}
      onChange={setChecked}
    />
  );
}

// ─── Stories ─────────────────────────────────────────────────────────────────

export const Playground = Controlled.bind({});
Playground.args = {
  label: "Include background checks",
  checked: false,
  indeterminate: false,
  error: false,
  highlight: false,
  secondary: false,
  disabled: false,
  size: "default",
};
Playground.parameters = {
  docs: {
    description: {
      story:
        "The base checkbox. Toggle `checked`, `indeterminate`, `error`, `highlight`, " +
        "`disabled`, and `size` via the Controls panel.",
    },
  },
};

// ─── State matrix ────────────────────────────────────────────────────────────

function Row({ label, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 8, fontFamily: "'Red Hat Text',sans-serif", fontSize: 13, color: "#8b8b8b" }}>
      <span style={{ width: 160, flexShrink: 0 }}>{label}</span>
      {children}
    </div>
  );
}

export const StateMatrix = () => {
  const [states, setStates] = useState({
    unselected: false,
    selected: true,
    indeterminate: false,
    errorUnselected: false,
    errorSelected: true,
    errorIndeterminate: false,
  });

  const toggle = (key) => setStates(s => ({ ...s, [key]: !s[key] }));

  return (
    <div style={{ padding: 16, background: "#fafafa", borderRadius: 8 }}>
      <Row label="Unselected">
        <Checkbox checked={states.unselected} onChange={() => toggle("unselected")} id="sm1" />
        <Checkbox label="With label" checked={states.unselected} onChange={() => toggle("unselected")} id="sm1l" />
        <Checkbox disabled checked={false} onChange={() => {}} id="sm1d" />
        <span style={{ fontSize: 12, color: "#aaa" }}>← disabled</span>
      </Row>
      <Row label="Selected">
        <Checkbox checked={states.selected} onChange={() => toggle("selected")} id="sm2" />
        <Checkbox label="With label" checked={states.selected} onChange={() => toggle("selected")} id="sm2l" />
        <Checkbox disabled checked onChange={() => {}} id="sm2d" />
        <span style={{ fontSize: 12, color: "#aaa" }}>← disabled</span>
      </Row>
      <Row label="Indeterminate">
        <Checkbox indeterminate onChange={() => {}} id="sm3" />
        <Checkbox label="Select all" indeterminate onChange={() => {}} id="sm3l" />
        <Checkbox disabled indeterminate onChange={() => {}} id="sm3d" />
        <span style={{ fontSize: 12, color: "#aaa" }}>← disabled</span>
      </Row>
      <div style={{ borderTop: "1px solid #e8e8e8", margin: "12px 0" }} />
      <Row label="Error unselected">
        <Checkbox error checked={states.errorUnselected} onChange={() => toggle("errorUnselected")} id="sm4" />
        <Checkbox error label="Agree to terms" checked={states.errorUnselected} onChange={() => toggle("errorUnselected")} id="sm4l" />
        <Checkbox error disabled checked={false} onChange={() => {}} id="sm4d" />
        <span style={{ fontSize: 12, color: "#aaa" }}>← disabled</span>
      </Row>
      <Row label="Error selected">
        <Checkbox error checked={states.errorSelected} onChange={() => toggle("errorSelected")} id="sm5" />
        <Checkbox error label="Agree to terms" checked={states.errorSelected} onChange={() => toggle("errorSelected")} id="sm5l" />
        <Checkbox error disabled checked onChange={() => {}} id="sm5d" />
        <span style={{ fontSize: 12, color: "#aaa" }}>← disabled</span>
      </Row>
      <Row label="Error indeterminate">
        <Checkbox error indeterminate onChange={() => {}} id="sm6" />
        <Checkbox error label="Select all" indeterminate onChange={() => {}} id="sm6l" />
      </Row>
    </div>
  );
};
StateMatrix.parameters = {
  docs: {
    description: {
      story:
        "Every type × state combination from the Figma component matrix. " +
        "Each row is live — click to toggle. Disabled examples are static.",
    },
  },
};

// ─── Indeterminate / Select all ───────────────────────────────────────────────

export const SelectAllPattern = () => {
  const [items, setItems] = useState([
    { id: "a", label: "Email notifications",  checked: true  },
    { id: "b", label: "Push notifications",   checked: false },
    { id: "c", label: "SMS alerts",           checked: true  },
  ]);

  const allChecked  = items.every(i => i.checked);
  const someChecked = items.some(i => i.checked) && !allChecked;

  const toggleAll  = (c) => setItems(items.map(i => ({ ...i, checked: c })));
  const toggleItem = (id)  => setItems(items.map(i => i.id === id ? { ...i, checked: !i.checked } : i));

  return (
    <div style={{ display: "flex", flexDirection: "column", fontFamily: "'Red Hat Text',sans-serif" }}>
      <Checkbox
        id="all"
        label="Select all"
        checked={allChecked}
        indeterminate={someChecked}
        onChange={toggleAll}
      />
      <div style={{ marginLeft: 12 }}>
        {items.map(item => (
          <Checkbox
            key={item.id}
            id={item.id}
            label={item.label}
            checked={item.checked}
            onChange={() => toggleItem(item.id)}
          />
        ))}
      </div>
    </div>
  );
};
SelectAllPattern.parameters = {
  docs: {
    description: {
      story:
        "The canonical Select All pattern. The parent checkbox is `indeterminate` " +
        "when some — but not all — children are checked. Toggling the parent " +
        "sets all children to the same state.",
    },
  },
};

// ─── Error with message ───────────────────────────────────────────────────────

export const ErrorWithMessage = () => {
  const [agreed, setAgreed]       = useState(false);
  const [submitted, setSubmitted] = useState(false);

  return (
    <div style={{ fontFamily: "'Red Hat Text',sans-serif" }}>
      <Checkbox
        id="terms"
        label="I agree to the terms and conditions"
        checked={agreed}
        error={!agreed && submitted}
        onChange={setAgreed}
        describedBy="terms-error"
      />
      {!agreed && submitted && (
        <p id="terms-error" style={{ fontSize: 13, color: "#9d2d2d", marginLeft: 44, marginTop: 4 }}>
          You must agree to continue.
        </p>
      )}
      <div style={{ marginTop: 12, marginLeft: 44 }}>
        <button
          onClick={() => setSubmitted(true)}
          style={{
            padding: "8px 16px", borderRadius: 6,
            background: "#3555a0", color: "#fff",
            border: "none", cursor: "pointer",
            fontFamily: "inherit", fontSize: 14,
          }}
        >
          Submit
        </button>
      </div>
    </div>
  );
};
ErrorWithMessage.parameters = {
  docs: {
    description: {
      story:
        "Error state paired with an associated error message. " +
        "The error message element uses `id` and the checkbox references it via " +
        "`aria-describedby`. Click Submit without agreeing to see the error.",
    },
  },
};

// ─── Highlight variant ────────────────────────────────────────────────────────

export const HighlightVariant = () => {
  const [rows, setRows] = useState([
    { id: "r1", label: "Staff meeting — Thursday 9am",   checked: true  },
    { id: "r2", label: "Volunteer orientation — Friday", checked: false },
    { id: "r3", label: "Board prep call — Monday",       checked: true  },
  ]);

  const toggle = (id) =>
    setRows(rows.map(r => r.id === id ? { ...r, checked: !r.checked } : r));

  return (
    <div style={{ background: "#fff", borderRadius: 8, border: "1px solid #e8e8e8", overflow: "hidden", fontFamily: "'Red Hat Text',sans-serif" }}>
      {rows.map((row, i) => (
        <div
          key={row.id}
          style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "12px 16px",
            borderBottom: i < rows.length - 1 ? "1px solid #f0f0f0" : "none",
          }}
        >
          <Checkbox
            id={row.id}
            highlight
            checked={row.checked}
            onChange={() => toggle(row.id)}
          />
          <span style={{ fontSize: 14, color: "#363636" }}>{row.label}</span>
        </div>
      ))}
    </div>
  );
};
HighlightVariant.parameters = {
  docs: {
    description: {
      story:
        "`highlight` adds a tinted background on the state-layer at rest. " +
        "Use when the checkbox lives inside a selectable list row — the tint " +
        "visually ties the control to the interactive surface. " +
        "Note: the resting-state token `fill.action.secondaryinverse.base` is currently " +
        "missing from the token file; a fallback is in use (see spec §5.3).",
    },
  },
};

// ─── Sizes ───────────────────────────────────────────────────────────────────

export const Sizes = () => (
  <div style={{ display: "flex", gap: 32, alignItems: "center", fontFamily: "'Red Hat Text',sans-serif" }}>
    <div>
      <p style={{ fontSize: 11, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Default — 18px</p>
      <Checkbox label="Default size" checked onChange={() => {}} id="sz1" />
    </div>
    <div>
      <p style={{ fontSize: 11, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Small — 16px</p>
      <Checkbox label="Small size" size="s" checked onChange={() => {}} id="sz2" />
    </div>
  </div>
);
Sizes.parameters = {
  docs: {
    description: {
      story:
        "Two visual sizes. Both use a 44×44px touch target — only the visible " +
        "box shrinks. The `s` size is appropriate in dense list contexts.",
    },
  },
};
