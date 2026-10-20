'use client';

import { useEffect, useState } from 'react';
import { errorMessage } from '@/lib/http';
import { ErrorBox, Spinner } from '@/components/ui';

const MAX_ROWS = 1000;
const MAX_COLS = 100;

interface SheetData {
  name: string;
  rows: string[][];
  truncated: boolean;
}

/** A, B, … Z, AA, AB… como en Excel. */
function columnName(index: number): string {
  let n = index;
  let name = '';
  do {
    name = String.fromCharCode(65 + (n % 26)) + name;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return name;
}

/** Vista previa de Excel (.xlsx, .xls, .ods) y CSV: una pestaña por hoja. */
export default function SheetView({ buffer, isCsv }: { buffer: ArrayBuffer; isCsv: boolean }) {
  const [sheets, setSheets] = useState<SheetData[] | null>(null);
  const [active, setActive] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const XLSX = await import('@e965/xlsx');
        // El CSV se decodifica aquí como UTF-8 (tildes y ñ correctas); el resto lo lee la librería.
        const book = isCsv
          ? XLSX.read(new TextDecoder('utf-8').decode(buffer), { type: 'string', sheetRows: MAX_ROWS + 1 })
          : XLSX.read(buffer, { type: 'array', sheetRows: MAX_ROWS + 1 });
        const data: SheetData[] = book.SheetNames.map((name) => {
          const rows = XLSX.utils.sheet_to_json<string[]>(book.Sheets[name], {
            header: 1,
            raw: false,
            defval: '',
          });
          return {
            name,
            truncated: rows.length > MAX_ROWS,
            rows: rows.slice(0, MAX_ROWS).map((r) => r.slice(0, MAX_COLS).map((c) => String(c ?? ''))),
          };
        });
        if (alive) setSheets(data);
      } catch (e) {
        if (alive) setError(errorMessage(e));
      }
    })();
    return () => {
      alive = false;
    };
  }, [buffer, isCsv]);

  if (error) return <ErrorBox message={`No se pudo mostrar la hoja de cálculo. ${error}`} />;
  if (!sheets) return <Spinner />;
  if (sheets.length === 0) return <ErrorBox message="El archivo no tiene hojas." />;

  const sheet = sheets[Math.min(active, sheets.length - 1)];
  const cols = Math.max(1, ...sheet.rows.map((r) => r.length));

  return (
    <div className="w-full">
      {sheets.length > 1 && (
        <div className="sheet-tabs">
          {sheets.map((s, i) => (
            <button
              key={s.name}
              className={`sheet-tab ${i === active ? 'sheet-tab--active' : ''}`}
              onClick={() => setActive(i)}
              title={s.name}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      <div className="preview-scroll">
        {sheet.rows.length === 0 ? (
          <p className="preview-note">Esta hoja está vacía.</p>
        ) : (
          <table className="sheet-table">
            <thead>
              <tr>
                <th className="sheet-corner" />
                {Array.from({ length: cols }, (_, c) => (
                  <th key={c}>{columnName(c)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sheet.rows.map((row, r) => (
                <tr key={r}>
                  <th>{r + 1}</th>
                  {Array.from({ length: cols }, (_, c) => (
                    <td key={c} title={row[c] || undefined}>
                      {row[c]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {sheet.truncated && (
        <p className="preview-note">
          Se muestran las primeras {MAX_ROWS} filas. Descarga el archivo para verlo completo.
        </p>
      )}
    </div>
  );
}