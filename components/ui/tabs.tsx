"use client";

import * as React from "react";

/* ═══════════════════════════════════════════════════════════
   Tabs — Base Web Style
   Underline-style tab navigation
   ═══════════════════════════════════════════════════════════ */

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue>({
  activeTab: "",
  setActiveTab: () => {},
});

function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
  className = "",
  style,
}: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "");
  const isControlled = value !== undefined;
  const activeTab = isControlled ? value : internalValue;
  const setActiveTab = isControlled
    ? (onValueChange ?? (() => {}))
    : (v: string) => {
        setInternalValue(v);
        onValueChange?.(v);
      };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className} style={style}>{children}</div>
    </TabsContext.Provider>
  );
}

function TabsList({
  children,
  className = "",
  style,
  variant: _variant,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  variant?: "line" | "pill";
}) {
  return <div className={`bw-tabs-list ${className}`} style={style} role="tablist">{children}</div>;
}

function TabsTrigger({
  value,
  children,
  className = "",
  style,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { activeTab, setActiveTab } = React.useContext(TabsContext);
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      className={`bw-tab-trigger ${isActive ? "active" : ""} ${className}`}
      style={style}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
}

function TabsContent({
  value,
  children,
  className = "",
  style,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { activeTab } = React.useContext(TabsContext);
  if (activeTab !== value) return null;

  return (
    <div role="tabpanel" className={className} style={style}>
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
