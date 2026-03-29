import { useState, useRef } from "react";
import type { PrintJob, PrintSettings, MockFile } from "../types";

export function usePrintJobs() {
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const jobIdRef = useRef(1);

  function calculateQuota(file: MockFile, settings: PrintSettings): number {
    const totalPages = file.pages;
    const printPages = settings.pageRange.trim()
      ? settings.pageRange.split(",").reduce((a, p) => {
          const m = p.trim().match(/^(\d+)-(\d+)$/);
          if (m) return a + Math.min(parseInt(m[2]), totalPages) - parseInt(m[1]) + 1;
          if (/^\d+$/.test(p.trim())) return a + 1;
          return a;
        }, 0)
      : totalPages;
    const sheets = Math.ceil(printPages / settings.nup_col / settings.nup_row);
    return Math.ceil(sheets / (settings.duplex ? 2 : 1)) * settings.copies;
  }

  function addJob(file: MockFile, settings: PrintSettings): PrintJob {
    const quota = calculateQuota(file, settings);
    const id = jobIdRef.current++;

    const newJob: PrintJob = {
      id,
      file: file.name,
      pages: quota,
      duplex: settings.duplex,
      margins: settings.margins.label,
      status: "Queued",
      copies: settings.copies
    };

    setJobs((prev) => [...prev, newJob]);

    setTimeout(
      () => setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status: "Printing" } : j))),
      2000
    );
    setTimeout(
      () => setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status: "Done" } : j))),
      5500
    );

    return newJob;
  }

  const pendingJobs = jobs.filter((j) => j.status === "Queued" || j.status === "Printing");

  return { jobs, addJob, pendingJobs, calculateQuota };
}