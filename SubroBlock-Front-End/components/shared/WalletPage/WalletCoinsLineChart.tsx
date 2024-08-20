import { CategoryScale, type ChartData, Chart as ChartJS, ChartOptions, Legend, LineElement, LinearScale, PointElement, Tick, Title, Tooltip, TooltipItem } from "chart.js";
import { format } from "date-fns";
import React, { useEffect, useMemo } from "react";
import { Line } from "react-chartjs-2";
import { Skeleton } from "@/components/ui/skeleton";
import { inter } from "@/lib/hooks/useGlobalStyles";
import useLoading from "@/lib/hooks/useLoading";
import { useRootWalletStore } from "@/store/useRootWalletStore";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const font = {
  family: inter.style.fontFamily,
  size: 12
}

export default function WalletCoinsLineChart() {
  const {
    analytics,
    fetchWalletAnalytics,
    balance
  } = useRootWalletStore();

  const [ loading, withLoading ] = useLoading();

  useEffect(() => {
    // 1 day after, because today may be skipped
    const dateTo = format(new Date(new Date().setDate(new Date().getDate() + 1)), "yyyy-MM-dd");
    // 4 days before today
    const dateFrom = format(new Date(new Date().setDate(new Date().getDate() - 4)), "yyyy-MM-dd");

    withLoading(async () => await fetchWalletAnalytics({
      dateTo,
      dateFrom
    }));
  }, [balance?.balance]); // eslint-disable-line react-hooks/exhaustive-deps

  const props = useMemo(() => {
    return ({
      options: {
        responsive: true,
        scales: {
          x: {
            // hide x-axis grid lines (vertical)
            grid: {
              display: false
            },
            // show dates, but hide duplicate dates
            ticks: {
              callback: (value: number, index: number, values: Tick[]) => {
                const label = format(analytics?.[index].hour || 0, "dd/MM/yyyy");
                return values.some((item) => item.label === label) ? null : label;
              },
              font: {
                ...font,
                size: 14
              }
            }
          },
          y: {
            ticks: {
              font
            }
          }
        },
        plugins: {
          tooltip: {
            titleFont: font,
            bodyFont: font,
            // show full date and details in tooltip
            callbacks: {
              title: (context: TooltipItem<"line">[]) => format(analytics?.[context[0].dataIndex].hour || 0, "dd/MM/yyyy HH:mm"),
              label: (context: TooltipItem<"line">) => {
                const dataset = context.dataset;
                if (dataset?.label === "Profit")
                  return `Profit: ${analytics?.[context.dataIndex].incomingTransactionsAmount}`;
                else if (dataset?.label === "Loss")
                  return `Loss: ${analytics?.[context.dataIndex].outgoingTransactionsAmount}`;
                return "";
              },
              afterLabel: (context: TooltipItem<"line">) => {
                const dataset = context.dataset;
                if (dataset?.label === "Profit")
                  return `Transactions: ${analytics?.[context.dataIndex].incomingTransactionsCount}`;
                else if (dataset?.label === "Loss")
                  return `Transactions: ${analytics?.[context.dataIndex].outgoingTransactionsCount}`;
                return "";
              }
            }
          }
        }
      } as ChartOptions<"line">,
      data: {
        labels: analytics?.map((item) => format(item.hour, "dd/MM/yyyy")),
        datasets: [
          {
            label: "Profit",
            data: analytics?.map((item) => item.incomingTransactionsAmount) || [],
            borderColor: "#FE891D",
            backgroundColor: "#FE891D",
            borderWidth: 1.5,
            pointRadius: 0,
            pointHitRadius: 64
          },
          {
            label: "Loss",
            data: analytics?.map((item) => item.outgoingTransactionsAmount) || [],
            borderColor: "#0D1C2C",
            backgroundColor: "#0D1C2C",
            borderWidth: 1.5,
            pointRadius: 0,
            pointHitRadius: 64
          }
        ]
      } as ChartData<"line">
    });
  }, [analytics]);

  if (loading || !analytics)
    return <Skeleton className="w-full h-full flex justify-center items-center text-secondary-foreground text-xs">
      loading...
    </Skeleton>;
  return <Line {...props} />;
}
