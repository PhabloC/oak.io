"use client";

import * as React from "react";
import { Tooltip, ResponsiveContainer, Legend } from "recharts";
import { cn } from "@/lib/utils";

const ChartContext = React.createContext({ config: {} });

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}

const ChartContainer = React.forwardRef(
  ({ id, config, children, className, ...props }, ref) => {
    const uniqueId = React.useId();
    const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;
    return (
      <ChartContext.Provider value={{ config: config || {}, chartId }}>
        <div
          data-chart={chartId}
          ref={ref}
          className={cn(
            "flex w-full min-h-[200px] flex-col gap-2 [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:overflow-visible",
            className
          )}
          style={
            {
              "--color-ganhos": config?.ganhos?.color ?? "var(--chart-1)",
              "--color-gastos": config?.gastos?.color ?? "var(--chart-2)",
              "--color-investimentos":
                config?.investimentos?.color ?? "var(--chart-3)",
              ...Object.fromEntries(
                Object.entries(config || {}).flatMap(([key, value]) =>
                  typeof value === "object" && value?.color
                    ? [[`--color-${key}`, value.color]]
                    : []
                )
              ),
            }
          }
          {...props}
        >
          <ResponsiveContainer width="100%" height="100%" minHeight={200}>
            {children}
          </ResponsiveContainer>
        </div>
      </ChartContext.Provider>
    );
  }
);
ChartContainer.displayName = "ChartContainer";

const ChartTooltip = ({ content, ...props }) => {
  return (
    <Tooltip
      {...props}
      content={
        content && React.isValidElement(content)
          ? React.cloneElement(content, {
              ...content.props,
              ...props,
            })
          : content
      }
    />
  );
};

const ChartTooltipContent = React.forwardRef(
  (
    {
      active,
      payload,
      label,
      labelClassName,
      labelFormatter,
      nameKey,
      hideLabel,
      hideIndicator,
      indicator = "dot",
      formatter,
      valueFormatter,
      ...props
    },
    ref
  ) => {
    const { config } = useChart();
    const name = nameKey && payload?.length ? payload[0].payload[nameKey] : null;
    const item = payload?.length ? payload[0] : null;
    const value = item?.value;
    const formattedLabel =
      labelFormatter && typeof labelFormatter === "function"
        ? labelFormatter(label, payload)
        : label;
    const formattedValue =
      valueFormatter && typeof valueFormatter === "function"
                  ? valueFormatter(value, name, item, 0, payload)
        : value;

    if (!active || !payload?.length) {
      return null;
    }

    const showLabel = !hideLabel && formattedLabel;

    return (
      <div
        ref={ref}
        className={cn(
          "flex min-w-[8rem] flex-col gap-1.5 rounded-lg border border-gray-700/50 bg-gray-900/95 px-2.5 py-1.5 text-xs shadow-xl backdrop-blur",
          props.className
        )}
      >
        {showLabel ? (
          <div className={cn("font-medium text-white", labelClassName)}>
            {formattedLabel}
          </div>
        ) : null}
        <div className="grid gap-1.5">
          {payload.map((item, index) => {
            const key = nameKey ? item.payload[nameKey] : item.name;
            const itemConfig = config[key] || {};
            const indicatorColor =
              item.payload?.fill || item.color || itemConfig?.color;
            return (
              <div
                key={item.dataKey}
                className={cn(
                  "flex w-full flex-wrap items-stretch gap-2 [&>svg]:size-2.5 [&>svg]:text-muted-foreground",
                  indicator === "dot" && "items-center"
                )}
              >
                {hideIndicator !== true ? (
                  <div
                    className={cn(
                      "shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]",
                      indicator === "dot" && "size-2.5",
                      indicator === "line" && "w-1",
                      indicator === "dashed" &&
                        "w-0 border-[1.5px] border-dashed bg-transparent",
                      indicator === "dashed" && "my-0.5"
                    )}
                    style={{
                      "--color-bg": indicatorColor,
                      "--color-border": indicatorColor,
                    }}
                  />
                ) : null}
                <div className="flex flex-1 justify-between gap-2 leading-none">
                  <span className="text-gray-400">
                    {itemConfig.label ?? key}
                  </span>
                  <span className="font-mono font-medium tabular-nums text-white">
                    {formatter && typeof formatter === "function"
                      ? formatter(item.value, name, item, index, payload)
                      : typeof formattedValue === "number"
                      ? formattedValue.toLocaleString()
                      : formattedValue}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
ChartTooltipContent.displayName = "ChartTooltipContent";

const ChartLegend = ({ content, ...props }) => {
  return (
    <Legend
      {...props}
      content={
        content && React.isValidElement(content)
          ? (legendProps) => React.cloneElement(content, legendProps)
          : content
      }
    />
  );
};

const ChartLegendContent = React.forwardRef(
  ({ className, nameKey, ...props }, ref) => {
    const { config } = useChart();
    const { payload } = props;

    if (!payload?.length) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-wrap justify-center gap-4 py-2 text-gray-300 [&>svg]:hidden",
          className
        )}
      >
        {payload.map((entry) => {
          const key = nameKey ? entry.payload?.[nameKey] : entry.dataKey;
          const itemConfig = config[key] || config[entry.dataKey] || {};

          return (
            <div
              key={entry.value ?? entry.dataKey}
              className="flex items-center gap-2"
            >
              <div
                className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor: entry.color ?? itemConfig.color,
                }}
              />
              <span className="text-muted-foreground text-xs">
                {itemConfig.label ?? entry.value ?? entry.dataKey}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
);
ChartLegendContent.displayName = "ChartLegendContent";

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartContext,
  useChart,
};
