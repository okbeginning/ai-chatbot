"use client";

import {
  ArrowUpDownIcon,
  CircleIcon,
  ClockIcon,
  GlobeIcon,
  KeyboardIcon,
  MousePointerClickIcon,
  MousePointerIcon,
  TypeIcon,
} from "lucide-react";
import type { ComponentProps, HTMLAttributes, ReactNode } from "react";
import { createContext, useContext } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export type RemoteControlStatus = "idle" | "thinking" | "acting" | "done" | "error";

export type RemoteControlActionType =
  | "screenshot"
  | "click"
  | "type"
  | "scroll"
  | "navigate"
  | "keypress"
  | "wait"
  | "done";

export type RemoteControlContextValue = {
  status: RemoteControlStatus;
};

const RemoteControlContext = createContext<RemoteControlContextValue | null>(
  null
);

const useRemoteControl = () => {
  const context = useContext(RemoteControlContext);
  if (!context) {
    throw new Error(
      "RemoteControl components must be used within RemoteControl"
    );
  }
  return context;
};

export type RemoteControlProps = HTMLAttributes<HTMLDivElement> & {
  status?: RemoteControlStatus;
};

export const RemoteControl = ({
  className,
  children,
  status = "idle",
  ...props
}: RemoteControlProps) => (
  <RemoteControlContext.Provider value={{ status }}>
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  </RemoteControlContext.Provider>
);

export type RemoteControlHeaderProps = HTMLAttributes<HTMLDivElement>;

export const RemoteControlHeader = ({
  className,
  children,
  ...props
}: RemoteControlHeaderProps) => (
  <div
    className={cn(
      "flex items-center gap-2 border-b bg-muted/50 px-3 py-2",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export type RemoteControlTitleProps = HTMLAttributes<HTMLParagraphElement>;

export const RemoteControlTitle = ({
  className,
  ...props
}: RemoteControlTitleProps) => (
  <p
    className={cn("flex-1 truncate font-medium text-foreground text-sm", className)}
    {...props}
  />
);

const statusConfig: Record<
  RemoteControlStatus,
  { label: string; className: string; dotClassName: string }
> = {
  idle: {
    label: "Idle",
    className: "text-muted-foreground",
    dotClassName: "bg-muted-foreground",
  },
  thinking: {
    label: "Thinking",
    className: "text-yellow-600",
    dotClassName: "bg-yellow-500 animate-pulse",
  },
  acting: {
    label: "Acting",
    className: "text-blue-600",
    dotClassName: "bg-blue-500 animate-pulse",
  },
  done: {
    label: "Done",
    className: "text-green-600",
    dotClassName: "bg-green-500",
  },
  error: {
    label: "Error",
    className: "text-destructive",
    dotClassName: "bg-destructive",
  },
};

export type RemoteControlStatusBadgeProps = ComponentProps<typeof Badge>;

export const RemoteControlStatusBadge = ({
  className,
  ...props
}: RemoteControlStatusBadgeProps) => {
  const { status } = useRemoteControl();
  const config = statusConfig[status];

  return (
    <Badge
      className={cn("gap-1.5 rounded-full text-xs", config.className, className)}
      variant="secondary"
      {...props}
    >
      <span className={cn("size-1.5 rounded-full", config.dotClassName)} />
      {config.label}
    </Badge>
  );
};

export type RemoteControlScreenProps = HTMLAttributes<HTMLDivElement> & {
  screenshot?: string;
  placeholder?: ReactNode;
};

export const RemoteControlScreen = ({
  className,
  children,
  screenshot,
  placeholder,
  ...props
}: RemoteControlScreenProps) => (
  <div
    className={cn(
      "relative flex-1 overflow-hidden bg-muted/30",
      className
    )}
    {...props}
  >
    {screenshot ? (
      // biome-ignore lint/performance/noImgElement: dynamic screenshot data URLs require native img
      <img
        alt="Remote screen"
        className="size-full object-contain"
        src={screenshot}
      />
    ) : (
      placeholder ?? (
        <div className="flex size-full items-center justify-center text-muted-foreground text-sm">
          <div className="flex flex-col items-center gap-2">
            <CircleIcon className="size-8 opacity-20" />
            <span>No screenshot available</span>
          </div>
        </div>
      )
    )}
    {children}
  </div>
);

export type RemoteControlCursorProps = HTMLAttributes<HTMLDivElement> & {
  x: number;
  y: number;
};

export const RemoteControlCursor = ({
  className,
  x,
  y,
  ...props
}: RemoteControlCursorProps) => (
  <div
    className={cn("pointer-events-none absolute z-10", className)}
    style={{ left: x, top: y, transform: "translate(-4px, -4px)" }}
    {...props}
  >
    <MousePointerIcon className="size-4 fill-yellow-400 text-yellow-600 drop-shadow" />
  </div>
);

const actionTypeConfig: Record<
  RemoteControlActionType,
  { icon: typeof CircleIcon; label: string }
> = {
  screenshot: { icon: CircleIcon, label: "Screenshot" },
  click: { icon: MousePointerClickIcon, label: "Click" },
  type: { icon: TypeIcon, label: "Type" },
  scroll: { icon: ArrowUpDownIcon, label: "Scroll" },
  navigate: { icon: GlobeIcon, label: "Navigate" },
  keypress: { icon: KeyboardIcon, label: "Key press" },
  wait: { icon: ClockIcon, label: "Wait" },
  done: { icon: CircleIcon, label: "Done" },
};

export type RemoteControlActionItem = {
  id: string;
  type: RemoteControlActionType;
  description?: string;
  timestamp?: Date;
};

export type RemoteControlActionEntryProps = HTMLAttributes<HTMLDivElement> & {
  type: RemoteControlActionType;
  description?: string;
  timestamp?: Date;
  isActive?: boolean;
};

export const RemoteControlActionEntry = ({
  className,
  type,
  description,
  timestamp,
  isActive = false,
  ...props
}: RemoteControlActionEntryProps) => {
  const { icon: Icon, label } = actionTypeConfig[type];

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-md px-2 py-1.5 text-xs transition-colors",
        isActive ? "bg-muted text-foreground" : "text-muted-foreground",
        className
      )}
      {...props}
    >
      <Icon className={cn("mt-0.5 size-3.5 shrink-0", isActive && "text-blue-500")} />
      <div className="min-w-0 flex-1">
        <span className="font-medium">{label}</span>
        {description && (
          <span className="ml-1 truncate opacity-75">{description}</span>
        )}
      </div>
      {timestamp && (
        <span className="shrink-0 tabular-nums opacity-50">
          {timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </span>
      )}
    </div>
  );
};

export type RemoteControlActionLogProps = HTMLAttributes<HTMLDivElement> & {
  title?: string;
};

export const RemoteControlActionLog = ({
  className,
  children,
  title = "Actions",
  ...props
}: RemoteControlActionLogProps) => (
  <div className={cn("border-t", className)} {...props}>
    <div className="px-3 py-2">
      <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
        {title}
      </p>
    </div>
    <ScrollArea>
      <div className="max-h-40 space-y-0.5 px-1 pb-2">{children}</div>
    </ScrollArea>
  </div>
);
