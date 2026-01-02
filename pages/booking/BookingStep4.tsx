import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingHeader } from '../../components/BookingHeader';
import { useBooking } from '../../context/BookingContext';
import { formatDurationLabel } from '../../lib/formatDuration';

const BookingStep4: React.FC = () => {
  const navigate = useNavigate();
  const {
    assetType,
    slots,
    loadSlots,
    availability,
    loadingAvailability,
    refreshAvailability,
    setScheduledAt,
    scheduledAt,
    durationMinutes,
    setDuration,
    submitBooking,
    lastBooking,
  } = useBooking();
  const timeZone = 'America/Argentina/Buenos_Aires';
  const getNowZoned = () => {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
      .formatToParts(new Date())
      .reduce<Record<string, string>>((acc, p) => {
        acc[p.type] = p.value;
        return acc;
      }, {});

    const y = Number(parts.year);
    const m = Number(parts.month);
    const d = Number(parts.day);
    const hh = Number(parts.hour);
    const mm = Number(parts.minute);
    const ss = Number(parts.second);
    const date = new Date(Date.UTC(y, m - 1, d, hh, mm, ss));
    return { date, y, m, d };
  };

  const todayIso = useMemo(() => {
    const { y, m, d } = getNowZoned();
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }, []);

  const getZonedParts = (iso: string) => {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
      .formatToParts(new Date(iso))
      .reduce<Record<string, string>>((acc, p) => {
        acc[p.type] = p.value;
        return acc;
      }, {});

    return {
      y: Number(parts.year),
      m: Number(parts.month),
      d: Number(parts.day),
      hh: Number(parts.hour),
      mm: Number(parts.minute),
      ss: Number(parts.second),
    };
  };

  const { y: initialYear, m: initialMonth } = getNowZoned();
  const [date, setDate] = useState(() => todayIso);
  const [yearMonth, setYearMonth] = useState({ year: initialYear, monthIndex: initialMonth - 1 });
  const monthFloor = useMemo(() => ({ year: initialYear, monthIndex: initialMonth - 1 }), [initialYear, initialMonth]);
  const [localError, setLocalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (lastBooking) {
      navigate('/dashboard', { replace: true });
    }
  }, [lastBooking, navigate]);

  useEffect(() => {
    loadSlots(date, assetType, durationMinutes).catch(() => undefined);
  }, [date, assetType, durationMinutes, loadSlots]);

  useEffect(() => {
    const { year, monthIndex } = yearMonth;
    const monthStart = `${year}-${String(monthIndex + 1).padStart(2, '0')}-01`;
    const today = todayIso;
    const startIso = monthStart < today ? today : monthStart;
    const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
    refreshAvailability(startIso, Math.min(daysInMonth, 45)).catch(() => undefined);
  }, [yearMonth, refreshAvailability, todayIso]);

  const selectedText = useMemo(() => {
    if (!scheduledAt) return 'Sin seleccionar';
    const d = new Date(scheduledAt);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }, [scheduledAt]);

  const monthLabel = useMemo(() => {
    const d = new Date(Date.UTC(yearMonth.year, yearMonth.monthIndex, 15, 12));
    return d.toLocaleDateString('es-AR', {
      month: 'long',
      year: 'numeric',
      timeZone,
    });
  }, [yearMonth]);

  const days = useMemo(() => {
    const { year, monthIndex } = yearMonth;
    const firstDay = new Date(Date.UTC(year, monthIndex, 1, 12));
    const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0, 12)).getUTCDate();
    const startOffset = (firstDay.getUTCDay() + 6) % 7; // Monday first
    const cells: { label: number | null; iso?: string }[] = [];
    for (let i = 0; i < startOffset; i++) cells.push({ label: null });
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(Date.UTC(year, monthIndex, day, 12));
      cells.push({ label: day, iso: dateObj.toISOString().slice(0, 10) });
    }
    return cells;
  }, [yearMonth]);

  const filteredSlots = useMemo(() => {
    const now = getNowZoned().date;
    return slots.filter((s) => new Date(s) >= now);
  }, [slots]);

  const confirm = async () => {
    setLocalError(null);
    setSubmitting(true);
    try {
      await submitBooking();
      navigate('/book/success');
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'No se pudo crear el turno');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <BookingHeader title="Agenda tu cita" step={3} onBack={() => navigate('/dashboard')} />

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-[1fr,320px] gap-8">
          <section className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center text-lg font-semibold">3</div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Selecciona fecha y hora</h2>
                <p className="text-gray-500">Disponibilidad próxima</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Mes</p>
                    <div className="flex items-center gap-2">
                      <button
                        className="h-9 w-9 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                        onClick={() =>
                          setYearMonth((prev) => {
                            const candidateMonth = prev.monthIndex - 1;
                            const candidateYear = candidateMonth < 0 ? prev.year - 1 : prev.year;
                            const candidateIndex = candidateMonth < 0 ? 11 : candidateMonth;
                            if (
                              candidateYear < monthFloor.year ||
                              (candidateYear === monthFloor.year && candidateIndex < monthFloor.monthIndex)
                            ) {
                              return prev;
                            }
                            return { year: candidateYear, monthIndex: candidateIndex };
                          })
                        }
                        disabled={
                          yearMonth.year === monthFloor.year && yearMonth.monthIndex === monthFloor.monthIndex
                        }
                        aria-label="Mes anterior"
                      >
                        ‹
                      </button>
                      <p className="text-base font-semibold text-gray-900">
                        {monthLabel}
                      </p>
                      <button
                        className="h-9 w-9 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
                        onClick={() =>
                          setYearMonth((prev) => {
                            const candidateMonth = prev.monthIndex + 1;
                            const candidateYear = candidateMonth > 11 ? prev.year + 1 : prev.year;
                            const candidateIndex = candidateMonth > 11 ? 0 : candidateMonth;
                            return { year: candidateYear, monthIndex: candidateIndex };
                          })
                        }
                        aria-label="Mes siguiente"
                      >
                        ›
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Turnos para {date}</p>
                  </div>
                </div>

                <div className="mb-2 grid grid-cols-7 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => (
                    <span key={d} className="text-center py-2">
                      {d}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2 sm:gap-3">
                  {days.map((day, idx) => {
                    if (!day.label) return <div key={idx} />;
                    const isPast = day.iso! < todayIso;
                    const slotsLeft = availability[day.iso!] ?? 0;
                    const capacityHint = slotsLeft;
                    const isLow = capacityHint > 0 && capacityHint <= 2;
                    const isGood = capacityHint > 2;
                    const isSelected = date === day.iso;
                    const isLoading = loadingAvailability && availability[day.iso!] === undefined;
                    const disabled = isPast || slotsLeft === 0;
                    return (
                      <button
                        key={day.iso}
                        onClick={() => {
                          if (disabled) return;
                          setDate(day.iso!);
                          setScheduledAt('');
                        }}
                        className={`relative h-16 rounded-xl border text-sm transition-all flex flex-col items-center justify-center gap-1 ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                                : disabled
                                ? 'border-gray-200 bg-red-50 text-red-500 cursor-not-allowed'
                                : isLow
                                ? 'border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300 hover:shadow-sm'
                                : isGood
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:shadow-sm'
                                : 'border-gray-200 bg-white text-gray-900 hover:border-emerald-400 hover:shadow-sm'
                            }`}
                      >
                        <span className="text-base font-semibold">{day.label}</span>
                        {isLoading ? <span className="text-[10px] text-gray-400">...</span> : null}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-200 border border-emerald-400"></span>
                    <span>Alta disponibilidad</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-amber-200 border border-amber-400"></span>
                    <span>Quedan pocos turnos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-100 border border-red-300"></span>
                    <span>Sin turnos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-blue-100 border border-blue-400"></span>
                    <span>Seleccionado</span>
                  </div>
                </div>

                <div className="mt-6 mb-2 font-semibold text-gray-800">Selecciona turno</div>
                {(() => {
                  const morning = filteredSlots.filter((s) => getZonedParts(s).hh < 15);
                  const afternoon = filteredSlots.filter((s) => getZonedParts(s).hh >= 15);
                  const fmtRange = (slots: string[]) => {
                    if (!slots.length) return '';
                    const first = getZonedParts(slots[0]);
                    const last = getZonedParts(slots[slots.length - 1]);
                    const fmt = ({ hh, mm }: { hh: number; mm: number }) =>
                      `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
                    return `${fmt(first)} - ${fmt(last)} hrs`;
                  };
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        disabled={!morning.length}
                        className={`h-12 rounded-xl border text-sm font-semibold transition-colors ${
                          morning.length
                            ? 'border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50'
                            : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        onClick={() => {
                          if (!morning.length) return;
                          setScheduledAt(morning[0]);
                          setDuration(durationMinutes ?? undefined);
                        }}
                      >
                        Mañana {fmtRange(morning)}
                      </button>
                      <button
                        disabled={!afternoon.length}
                        className={`h-12 rounded-xl border text-sm font-semibold transition-colors ${
                          afternoon.length
                            ? 'border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50'
                            : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        onClick={() => {
                          if (!afternoon.length) return;
                          setScheduledAt(afternoon[0]);
                          setDuration(durationMinutes ?? undefined);
                        }}
                      >
                        Tarde {fmtRange(afternoon)}
                      </button>
                    </div>
                  );
                })()}
              </div>

              <div className="bg-gradient-to-br from-emerald-50 via-white to-blue-50 rounded-2xl p-6 border border-emerald-100">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-emerald-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M4.5 18.75V7.5a2.25 2.25 0 012.25-2.25h10.5A2.25 2.25 0 0119.5 7.5v11.25m-15 0A2.25 2.25 0 006.75 21h10.5A2.25 2.25 0 0019.5 18.75m-15 0v-7.5A2.25 2.25 0 016.75 9h10.5a2.25 2.25 0 012.25 2.25v7.5m-12-3h.008v.008H7.5v-.008zm3 0h.008v.008H10.5v-.008zm3 0h.008v.008H13.5v-.008z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-emerald-600 font-semibold">Recordatorio</p>
                    <p className="text-gray-700">Un asesor confirmará tu cita y preparará el taller para tu llegada.</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
                  <p className="text-sm text-gray-600 mb-1">Horario elegido</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedText}</p>
                  <p className="text-sm text-gray-500">Duración estimada: {formatDurationLabel(durationMinutes)}</p>
                  <p className="text-xs text-gray-400">Horas en zona: Mendoza, Argentina</p>
                </div>
              </div>
            </div>
          </section>

          <aside className="bg-white rounded-2xl shadow-sm p-6 h-fit">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center font-semibold">✓</div>
              <div>
                <p className="text-sm text-gray-500">Paso 3 de 3</p>
                <p className="text-lg font-semibold text-gray-900">Revisión final (Verificar los datos del turno si son correctos)</p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Servicio</span>
                <span className="font-medium text-gray-900">Diagnóstico</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Tipo</span>
                <span className="font-medium text-gray-900">{assetType === 'VEHICLE' ? 'Vehículo' : 'Repuesto'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Fecha</span>
                <span className="font-medium text-gray-900">{selectedText}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Duración</span>
                <span className="font-medium text-gray-900">{formatDurationLabel(durationMinutes)}</span>
              </div>
            </div>

            {localError && <p className="mt-4 text-sm text-red-600">{localError}</p>}

            <button
              className="w-full mt-6 h-12 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors shadow-sm"
              onClick={confirm}
              disabled={!scheduledAt || submitting}
            >
              {submitting ? 'Confirmando...' : 'Confirmar reserva'}
            </button>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default BookingStep4;