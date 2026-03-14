import { useState, useEffect } from 'react';
import { preciosService } from '../services/services';

const Calendar = ({ fechasOcupadas, onSelectDates, propiedadId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedStart, setSelectedStart] = useState(null);
  const [selectedEnd, setSelectedEnd] = useState(null);
  const [fechasBloqueadas, setFechasBloqueadas] = useState({});

  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseLocalDate = (dateString) => {
    const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  useEffect(() => {
    const cargarFechasBloqueadas = async () => {
      if (!propiedadId) return;

      try {
        const data = await preciosService.obtenerBloqueadas(propiedadId);
        const bloqueadasMap = {};

        (data.bloqueadas || []).forEach((item) => {
          const fecha = item.fecha.split('T')[0];
          bloqueadasMap[fecha] = true;
        });

        setFechasBloqueadas(bloqueadasMap);
      } catch (error) {
        setFechasBloqueadas({});
      }
    };

    cargarFechasBloqueadas();
  }, [propiedadId]);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isFechaOcupada = (fecha) => {
    const fechaCheck = new Date(fecha);
    const fechaCheckStr = formatLocalDate(fechaCheck);

    if (fechasBloqueadas[fechaCheckStr]) {
      return true;
    }

    return fechasOcupadas.some(reserva => {
      const entrada = parseLocalDate(reserva.fecha_entrada);
      const salida = parseLocalDate(reserva.fecha_salida);
      return fechaCheck >= entrada && fechaCheck < salida;
    });
  };

  const isDateInRange = (date) => {
    if (!selectedStart || !selectedEnd) return false;
    const start = new Date(selectedStart);
    const end = new Date(selectedEnd);
    return date >= start && date <= end;
  };

  const handleDateClick = (day) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    // No permitir fechas pasadas
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (clickedDate < today) return;

    // No permitir fechas ocupadas
    if (isFechaOcupada(clickedDate)) return;

    if (!selectedStart) {
      setSelectedStart(clickedDate);
      setSelectedEnd(null);
    } else if (!selectedEnd) {
      if (clickedDate > selectedStart) {
        setSelectedEnd(clickedDate);
        onSelectDates(
          formatLocalDate(selectedStart),
          formatLocalDate(clickedDate)
        );
      } else {
        setSelectedStart(clickedDate);
        setSelectedEnd(null);
      }
    } else {
      setSelectedStart(clickedDate);
      setSelectedEnd(null);
    }
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    // Celdas vacías antes del primer día
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const fecha = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const isPast = fecha < today;
      const isOccupied = isFechaOcupada(fecha);
      const isStart = selectedStart && 
        fecha.toDateString() === selectedStart.toDateString();
      const isEnd = selectedEnd && 
        fecha.toDateString() === selectedEnd.toDateString();
      const isInRange = isDateInRange(fecha);

      let className = 'h-10 flex items-center justify-center rounded text-sm font-medium cursor-pointer ';
      
      if (isPast) {
        className += 'bg-gray-200 text-gray-400 cursor-not-allowed';
      } else if (isOccupied) {
        className += 'bg-red-500 text-white cursor-not-allowed';
      } else if (isStart || isEnd) {
        className += 'bg-primary-600 text-white';
      } else if (isInRange) {
        className += 'bg-primary-100 text-primary-700';
      } else {
        className += 'bg-green-50 text-gray-700 hover:bg-green-200';
      }

      days.push(
        <div
          key={day}
          onClick={() => !isPast && !isOccupied && handleDateClick(day)}
          className={className}
          title={isOccupied ? 'Fecha bloqueada' : isPast ? 'Fecha pasada' : 'Disponible'}
        >
          {day}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <button 
              onClick={prevMonth}
              className="p-2 hover:bg-gray-200 rounded-lg"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <h3 className="text-lg font-bold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <button 
              onClick={nextMonth}
              className="p-2 hover:bg-gray-200 rounded-lg"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-3">
            {dayNames.map(day => (
              <div key={day} className="h-8 flex items-center justify-center font-semibold text-gray-600 text-xs">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days}
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Bloqueado/Ocupado</span>
          </div>
        </div>

        {selectedStart && selectedEnd && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <i className="fas fa-check-circle mr-2"></i>
              Entrada: {selectedStart.toLocaleDateString('es-GT')}
            </p>
            <p className="text-sm text-blue-800">
              <i className="fas fa-check-circle mr-2"></i>
              Salida: {selectedEnd.toLocaleDateString('es-GT')}
            </p>
          </div>
        )}
      </div>
    );
  };

  return renderCalendar();
};

export default Calendar;
