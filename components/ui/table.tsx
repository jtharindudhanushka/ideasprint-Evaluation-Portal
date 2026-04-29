import * as React from "react";

/* ═══════════════════════════════════════════════════════════
   Table — Base Web Style
   Clean, minimal tables with hover states
   ═══════════════════════════════════════════════════════════ */

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className = "", ...props }, ref) => (
    <table ref={ref} className={`bw-table ${className}`} {...props} />
  )
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ ...props }, ref) => <thead ref={ref} {...props} />
);
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ ...props }, ref) => <tbody ref={ref} {...props} />
);
TableBody.displayName = "TableBody";

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className = "", ...props }, ref) => <tr ref={ref} className={className} {...props} />
);
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className = "", ...props }, ref) => <th ref={ref} className={className} {...props} />
);
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className = "", ...props }, ref) => <td ref={ref} className={className} {...props} />
);
TableCell.displayName = "TableCell";

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
