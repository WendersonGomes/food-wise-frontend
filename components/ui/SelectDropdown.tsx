"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectDropdownOption<TValue extends string = string> = {
  value: TValue;
  label: string;
  description?: string;
};

type SelectDropdownProps<TValue extends string = string> = {
  label?: string;
  options: Array<SelectDropdownOption<TValue>>;
  value: TValue;
  className?: string;
  onChange: (value: TValue) => void;
  renderOption?: (
    option: SelectDropdownOption<TValue>,
    isSelected: boolean,
  ) => ReactNode;
  renderValue?: (option: SelectDropdownOption<TValue>) => ReactNode;
};

type DropdownStyle = Pick<
  CSSProperties,
  "bottom" | "left" | "maxHeight" | "top" | "width"
>;

export function SelectDropdown<TValue extends string = string>({
  label,
  options,
  value,
  className,
  onChange,
  renderOption,
  renderValue,
}: SelectDropdownProps<TValue>) {
  const [isOpen, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<DropdownStyle | null>(
    null,
  );
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const selectedOption =
    options.find((option) => option.value === value) ?? options[0];

  const updateDropdownPosition = useCallback(() => {
    const button = buttonRef.current;

    if (!button || typeof window === "undefined") {
      return;
    }

    const rect = button.getBoundingClientRect();
    const viewportPadding = 16;
    const gap = 8;
    const maxMenuHeight = 288;
    const minMenuHeight = 160;
    const spaceBelow = window.innerHeight - rect.bottom - gap - viewportPadding;
    const spaceAbove = rect.top - gap - viewportPadding;
    const shouldOpenAbove = spaceBelow < minMenuHeight && spaceAbove > spaceBelow;
    const availableHeight = shouldOpenAbove ? spaceAbove : spaceBelow;
    const left = Math.min(
      Math.max(rect.left, viewportPadding),
      window.innerWidth - rect.width - viewportPadding,
    );

    setDropdownStyle({
      bottom: shouldOpenAbove
        ? window.innerHeight - rect.top + gap
        : undefined,
      left,
      maxHeight: Math.max(
        minMenuHeight,
        Math.min(maxMenuHeight, availableHeight),
      ),
      top: shouldOpenAbove ? undefined : rect.bottom + gap,
      width: rect.width,
    });
  }, []);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (
        !dropdownRef.current?.contains(target) &&
        !listboxRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    updateDropdownPosition();

    window.addEventListener("resize", updateDropdownPosition);
    window.addEventListener("scroll", updateDropdownPosition, true);

    return () => {
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", updateDropdownPosition, true);
    };
  }, [isOpen, updateDropdownPosition]);

  function selectValue(nextValue: TValue) {
    onChange(nextValue);
    setOpen(false);
  }

  function toggleDropdown() {
    if (!isOpen) {
      updateDropdownPosition();
    }

    setOpen((currentValue) => !currentValue);
  }

  function renderDefaultOptionContent(
    option: SelectDropdownOption<TValue>,
  ) {
    return (
      <span className="min-w-0">
        <span className="block truncate">{option.label}</span>
        {option.description ? (
          <span className="mt-0.5 block truncate text-xs font-medium text-(--muted-foreground)">
            {option.description}
          </span>
        ) : null}
      </span>
    );
  }

  const listbox =
    typeof document !== "undefined" && dropdownStyle ? (
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            className="fixed z-[70] overflow-y-auto rounded-3xl bg-(--surface) p-2 shadow-[0_22px_70px_rgba(15,23,42,0.18)] ring-1 ring-black/5"
            id={listboxId}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            ref={listboxRef}
            role="listbox"
            style={dropdownStyle}
            transition={{ duration: 0.16 }}
          >
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  aria-selected={isSelected}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-3xl px-3 py-2.5 text-left text-sm font-semibold transition-colors",
                    isSelected
                      ? "bg-(--accent-soft) text-(--accent)"
                      : "text-foreground hover:bg-(--surface-strong)",
                  )}
                  key={option.value}
                  role="option"
                  type="button"
                  onClick={() => selectValue(option.value)}
                >
                  {renderOption
                    ? renderOption(option, isSelected)
                    : renderDefaultOptionContent(option)}
                  {isSelected ? (
                    <Check className="h-4 w-4 shrink-0" strokeWidth={1.9} />
                  ) : null}
                </button>
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    ) : null;

  return (
    <div className={cn("relative grid gap-2", className)} ref={dropdownRef}>
      {label ? (
        <span className="text-sm font-medium text-foreground">{label}</span>
      ) : null}

      <motion.button
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="flex min-h-11 w-full items-center justify-between gap-3 rounded-3xl bg-background px-4 text-left text-sm font-semibold text-foreground outline-none ring-1 ring-transparent transition-colors hover:bg-(--surface-strong) focus:ring-(--ring)"
        ref={buttonRef}
        type="button"
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={toggleDropdown}
      >
        <span className="min-w-0 flex-1">
          {selectedOption && renderValue
            ? renderValue(selectedOption)
            : selectedOption
              ? renderDefaultOptionContent(selectedOption)
              : "Selecione"}
        </span>
        <motion.span
          aria-hidden="true"
          className="shrink-0 text-(--muted-foreground)"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
        >
          <ChevronDown className="h-4 w-4" strokeWidth={1.9} />
        </motion.span>
      </motion.button>

      {listbox ? createPortal(listbox, document.body) : null}
    </div>
  );
}
