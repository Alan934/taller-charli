import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingHeader } from '../../components/BookingHeader';
import { BookingTimeType } from '../../types/enums';
import { useBooking } from '../../context/BookingContext';
import { formatDurationLabel } from '../../lib/formatDuration';

const getFriendlyErrorMessage = (msg: string): string => {
  const map: Record<string, string> = {
    'Alguna falla no corresponde a vehículos': 'Una de las fallas seleccionadas (ej. relacionada a partes específicas) no es válida para un vehículo completo.',
    'Alguna falla seleccionada no existe': 'Una de las fallas seleccionadas ya no está disponible.',
    'Vehículo inválido para el cliente': 'El vehículo seleccionado no corresponde al cliente actual.',
    'Datos del vehículo requeridos': 'Falta información necesaria del vehículo.',
    'Alguna falla no corresponde a la categoría de la pieza seleccionada': 'La falla no coincide con el tipo de pieza elegida.',
  };
  return map[msg] || msg;
};

const BookingStep4: React.FC = () => {
  const navigate = useNavigate();
  const {
    assetType,
    slots,
    dayRanges,
    loadSlots,
    availability,
    loadingAvailability,
    refreshAvailability,
    setScheduledAt,
    scheduledAt,
    timeType,
    setTimeType,
    durationMinutes,
    setDuration,
    submitBooking,
    lastBooking,
    customerId,
    createCustomer,
    existingVehicleId,
    vehicle,
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
    return { date, y, m, d, hh, mm };
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
  const [redirectingToStep1, setRedirectingToStep1] = useState(false);
  const [tab, setTab] = useState<'SHIFT' | 'SPECIFIC'>('SHIFT');
  const redirectTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimer.current) {
        clearTimeout(redirectTimer.current);
      }
    };
  }, []);
  const [submitting, setSubmitting] = useState(false);

  // No redirigir automáticamente si hay lastBooking; el usuario debe ver la pantalla de éxito

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
    const startStr = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    const duration = durationMinutes || 60;
    const endD = new Date(d.getTime() + duration * 60000);
    const endStr = endD.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });

    return `${d.toLocaleDateString()} ${startStr} - ${endStr}`;
  }, [scheduledAt, durationMinutes]);

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
    return slots.filter((s) => {
      const { y, m, d, hh, mm } = getZonedParts(s);
      // Comparamos usando partes locales convertidas a UTC para consistencia
      const slotTime = new Date(Date.UTC(y, m - 1, d, hh, mm));
      return slotTime >= now;
    });
  }, [slots]);

  // Generamos información dinámica de los turnos basada en los slots disponibles
  const shiftInfo = useMemo(() => {
    const morningSlots: string[] = [];
    const afternoonSlots: string[] = [];
    const dur = durationMinutes || 60;

    // Clasificar slots en mañana vs tarde (corte arbitrario 14hs)
    filteredSlots.forEach((slot) => {
      const { hh } = getZonedParts(slot);
      if (hh < 14) {
        morningSlots.push(slot);
      } else {
        afternoonSlots.push(slot);
      }
    });

    // Lógica para deshabilitar si ya pasó el turno (solo para el día actual)
    // Basado en hora Argentina
    const isToday = date === todayIso;
    const { hh: currentH, mm: currentM } = getNowZoned();
    const currentMinutes = currentH * 60 + currentM;

    let disableMorning = false;
    let disableAfternoon = false;

    // Obtener límites reales de la configuración
    // Default fallback si no hay dayRanges
    let morningCutoff = 13 * 60; 
    let afternoonCutoff = 23 * 60 + 59; 

    if (dayRanges && dayRanges.length > 0) {
      // Turno Mañana (start < 13)
      const mRange = dayRanges.find((r) => parseInt(r.start.split(':')[0]) < 13);
      if (mRange) {
        const [endsH, endsM] = mRange.end.split(':').map(Number);
        morningCutoff = endsH * 60 + endsM;
      }
      // Turno Tarde (start >= 13)
      const aRange = dayRanges.find((r) => parseInt(r.start.split(':')[0]) >= 13);
      if (aRange) {
        const [endsH, endsM] = aRange.end.split(':').map(Number);
        afternoonCutoff = endsH * 60 + endsM;
      }
    }

    if (isToday) {
      if (currentMinutes >= morningCutoff) disableMorning = true;
      if (currentMinutes >= afternoonCutoff) disableAfternoon = true;
    }

    const formatTime = (iso: string) => {
      const { hh, mm } = getZonedParts(iso);
      return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    };

    const getRangeLabel = (isMorning: boolean, group: string[]) => {
      // Prioridad: Usar rangos reales devueltos por el backend (workdays)
      if (dayRanges && dayRanges.length > 0) {
        const matchingStart = dayRanges.find((r) => {
           const [h, m] = r.start.split(':').map(Number);
           // Rango inicia en la mañana si < 13:00, tarde si >= 13:00
           return isMorning ? h < 13 : h >= 13;
        });
        if (matchingStart) {
           return `${matchingStart.start.substring(0, 5)} - ${matchingStart.end.substring(0, 5)}`;
        }
      }

      if (group.length === 0) return 'No disponible';
      const first = group[0];
      const last = group[group.length - 1];
      
      const startLabel = formatTime(first);
      
      // Calcular hora final del último slot
      const lastDate = new Date(last);
      const endDate = new Date(lastDate.getTime() + dur * 60000);
      const endLabel = formatTime(endDate.toISOString());
      
      return `${startLabel} - ${endLabel}`;
    };

    return {
      morning: {
        available: !disableMorning && morningSlots.length > 0,
        label: getRangeLabel(true, morningSlots),
        firstSlot: morningSlots[0],
      },
      afternoon: {
        available: !disableAfternoon && afternoonSlots.length > 0,
        label: getRangeLabel(false, afternoonSlots),
        firstSlot: afternoonSlots[0],
      },
    };
  }, [filteredSlots, durationMinutes, dayRanges, date, todayIso]);

  const confirm = async () => {
    setLocalError(null);
    setRedirectingToStep1(false);
    if (redirectTimer.current) {
      clearTimeout(redirectTimer.current);
      redirectTimer.current = null;
    }

    // Paso 1: Cliente
    if (!customerId && !createCustomer) {
      console.log('[BookingStep4] Validation failed: Missing customer', { customerId, createCustomer });
      setLocalError('Paso 1: Asigna o crea un cliente antes de confirmar.');
      setRedirectingToStep1(true);
      redirectTimer.current = setTimeout(() => navigate('/book/step1'), 1300);
      return;
    }

    // Paso 1: Vehículo
    if (assetType === 'VEHICLE' && !existingVehicleId && !vehicle) {
      const hint = customerId ? 'No se encontró vehículo asignado para el cliente seleccionado.' : 'Selecciona un cliente para elegir vehículo.';
      setLocalError(`Paso 1: Selecciona un vehículo existente o completa los datos del vehículo. ${hint}`);
      setRedirectingToStep1(true);
      redirectTimer.current = setTimeout(() => navigate('/book/step1'), 1300);
      return;
    }

    setSubmitting(true);
    try {
      await submitBooking();
      navigate('/book/success');
    } catch (err) {
      const originalMessage = err instanceof Error ? err.message : 'No se pudo crear el turno';
      const friendlyMessage = getFriendlyErrorMessage(originalMessage);
      
      const missingCustomer = originalMessage.toLowerCase().includes('selecciona un cliente existente o crea uno nuevo') 
        || originalMessage.toLowerCase().includes('cliente no encontrado');

      console.log('[booking-confirm-error]', {
        message: originalMessage,
        assetType,
        customerId,
        createCustomer: !!createCustomer,
        existingVehicleId,
        hasVehicle: !!vehicle,
      });

      if (missingCustomer) {
        setLocalError('Paso 1: Falta asignar el cliente. Te llevamos al Paso 1 para completarlo.');
        setRedirectingToStep1(true);
        redirectTimer.current = setTimeout(() => navigate('/book/step1'), 1300);
      } else {
        setLocalError(friendlyMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#0f1720]">
      <BookingHeader title="Agenda tu cita" step={3} onBack={() => navigate('/dashboard')} />

      <main className="max-w-5xl mx-auto px-6 py-10">
        {redirectingToStep1 && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 px-4 py-3 text-amber-800 dark:text-amber-200 shadow-sm">
            <span className="material-symbols-outlined mt-0.5">error</span>
            <div>
              <p className="font-semibold text-sm">Paso 1: Falta asignar cliente</p>
              <p className="text-sm">Volvemos al Paso 1 para que completes o selecciones el cliente.</p>
              <button
                type="button"
                className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:underline"
                onClick={() => navigate('/book/step1')}
              >
                Ir ahora
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr,320px] gap-8">
          <section className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 dark:text-emerald-400 flex items-center justify-center text-lg font-bold">3</div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Selecciona fecha y hora</h2>
                <p className="text-slate-500 dark:text-slate-400">Disponibilidad próxima</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Mes</p>
                    <div className="flex items-center gap-2">
                      <button
                        className="h-9 w-9 rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40"
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
                      <p className="text-base font-bold text-slate-900 dark:text-white">
                        {monthLabel}
                      </p>
                      <button
                        className="h-9 w-9 rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
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
                    <p className="text-sm text-slate-500 dark:text-slate-400">Turnos para {date}</p>
                  </div>
                </div>

                <div className="mb-2 grid grid-cols-7 text-xs font-bold text-slate-400 uppercase tracking-wide">
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
                        className={`relative w-full aspect-square rounded-xl border text-sm transition-all flex flex-col items-center justify-center gap-1 ${
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

                <div className="mt-6 mb-4">
                  <div className="flex gap-6 border-b border-gray-100 mb-4">
                    <button
                      className={`pb-2 text-sm font-semibold transition-colors ${
                        tab === 'SHIFT' ? 'border-b-2 border-emerald-500 text-emerald-600' : 'text-gray-400 hover:text-gray-600'
                      }`}
                      onClick={() => {
                        setTab('SHIFT');
                        setScheduledAt('');
                        setTimeType(BookingTimeType.MORNING); // Reset/Default
                      }}
                    >
                      Por Turno (Recomendado)
                    </button>
                    <button
                      className={`pb-2 text-sm font-semibold transition-colors ${
                        tab === 'SPECIFIC' ? 'border-b-2 border-emerald-500 text-emerald-600' : 'text-gray-400 hover:text-gray-600'
                      }`}
                      onClick={() => {
                        setTab('SPECIFIC');
                        setScheduledAt('');
                        setTimeType(BookingTimeType.SPECIFIC);
                      }}
                    >
                      Horario Exacto
                    </button>
                  </div>

                  {tab === 'SHIFT' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        disabled={!shiftInfo.morning.available}
                        className={`h-16 rounded-xl border flex flex-col items-center justify-center transition-all ${
                          timeType === BookingTimeType.MORNING && scheduledAt
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-500'
                            : !shiftInfo.morning.available
                            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-200 hover:bg-emerald-50/50'
                        }`}
                        onClick={() => {
                          if (!shiftInfo.morning.available) return;
                          // Usar el primer slot real disponible
                          setScheduledAt(shiftInfo.morning.firstSlot);
                          setTimeType(BookingTimeType.MORNING);
                          setDuration(durationMinutes ?? undefined);
                        }}
                      >
                        <span className="font-bold text-base">Turno Mañana</span>
                        <span className="text-xs opacity-75">{shiftInfo.morning.label}</span>
                      </button>
                      <button
                        disabled={!shiftInfo.afternoon.available}
                        className={`h-16 rounded-xl border flex flex-col items-center justify-center transition-all ${
                          timeType === BookingTimeType.AFTERNOON && scheduledAt
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-500'
                            : !shiftInfo.afternoon.available
                            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-200 hover:bg-emerald-50/50'
                        }`}
                        onClick={() => {
                          if (!shiftInfo.afternoon.available) return;
                          // Usar el primer slot real disponible
                          setScheduledAt(shiftInfo.afternoon.firstSlot);
                          setTimeType(BookingTimeType.AFTERNOON);
                          setDuration(durationMinutes ?? undefined);
                        }}
                      >
                        <span className="font-bold text-base">Turno Tarde</span>
                        <span className="text-xs opacity-75">{shiftInfo.afternoon.label}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {filteredSlots.length === 0 ? (
                        <div className="col-span-full text-center py-4 text-gray-400 text-sm">
                          No hay horarios exactos disponibles para este día.
                        </div>
                      ) : (
                        filteredSlots.map((slot) => {
                          const { hh, mm } = getZonedParts(slot);
                          const label = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
                          const isSelected = scheduledAt === slot && timeType === BookingTimeType.SPECIFIC;
                          
                          return (
                            <button
                              key={slot}
                              className={`py-2 px-1 rounded-lg border text-sm font-medium transition-all ${
                                isSelected
                                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                                  : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-300 hover:shadow-sm'
                              }`}
                              onClick={() => {
                                setScheduledAt(slot);
                                setTimeType(BookingTimeType.SPECIFIC);
                                setDuration(durationMinutes ?? undefined);
                              }}
                            >
                              {label}
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
                {/* End Selection Logic */}
              </div>

              <div className="bg-gradient-to-br from-emerald-50/50 via-white to-blue-50/50 dark:from-emerald-900/20 dark:via-slate-800 dark:to-blue-900/10 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-900/30 shadow-sm">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 flex flex-shrink-0 items-center justify-center shadow-sm border border-emerald-100 dark:border-slate-600">
                    <span className="material-symbols-outlined text-emerald-500 dark:text-emerald-400">campaign</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200 uppercase tracking-wide mb-1">Recordatorio</p>
                    <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                      Un asesor confirmará tu cita a la brevedad. Recibirás una notificación y un correo cuando tu turno esté confirmado.
                    </p>
                  </div>
                </div>
                <div className="bg-white dark:bg-[#1a2632] rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-700 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Horario seleccionado</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                        {selectedText === 'Sin seleccionar' ? '--/--/--' : selectedText}
                    </p>
                  </div>
                  <div className="flex gap-4 pt-2 border-t border-gray-50 dark:border-slate-700">
                    <div>
                        <p className="text-xs text-gray-400">Duración</p>
                        <p className="font-semibold text-gray-700 dark:text-slate-200">{formatDurationLabel(durationMinutes)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Zona Horaria</p>
                        <p className="font-semibold text-gray-700 dark:text-slate-200">Mendoza (GMT-3)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 h-fit sticky top-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 dark:text-emerald-400 flex items-center justify-center font-bold">✓</div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Paso 3 de 3</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Revisión final</p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
              <div className="flex items-center justify-between pb-3 border-b border-slate-50 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Servicio</span>
                <span className="font-bold text-slate-900 dark:text-white text-right">Diagnóstico</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-50 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Tipo</span>
                <span className="font-bold text-slate-900 dark:text-white text-right">{assetType === 'VEHICLE' ? 'Vehículo' : 'Repuesto'}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-50 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Fecha</span>
                <span className="font-bold text-slate-900 dark:text-white text-right break-words max-w-[60%]">{selectedText}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Duración</span>
                <span className="font-bold text-slate-900 dark:text-white text-right">{formatDurationLabel(durationMinutes)}</span>
              </div>
            </div>

            {localError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-4 flex gap-3 animate-pulse shadow-sm">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400 shrink-0">error</span>
                <div>
                  <h3 className="font-bold text-red-800 dark:text-red-300 text-sm mb-1">No se pudo confirmar</h3>
                  <p className="text-red-700 dark:text-red-200 text-sm leading-relaxed">{localError}</p>
                </div>
              </div>
            )}

            <button
              className="w-full mt-6 h-14 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 text-lg"
              onClick={confirm}
              disabled={!scheduledAt || submitting}
            >
              {submitting ? 'Confirmando...' : 'Confirmar Reserva'}
            </button>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default BookingStep4;