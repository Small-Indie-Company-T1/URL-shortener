import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { RechartsDevtools } from '@recharts/devtools';
import dayjs from 'dayjs';

import { useCallback, useEffect, useRef, useState } from 'react';
import useLinks from '../../hooks/useLinks.js';
import DropdownCard from '../DropDownCard.jsx';

export default function LinkStats({ short_code }) {
  const { getStats, isLoading } = useLinks();
  const [clicks, setClicks] = useState([]);
  const [data, setData] = useState({ day: [], week: [], month: [] });
  const [timespan, setTimespan] = useState('day');

  useEffect(() => {
    if (clicks.length) {
      const now = dayjs();
      const hour_boundary = now
        .add(1, 'hour')
        .startOf('hour')
        .subtract(24, 'hour');
      let day = Array.from({ length: 24 }, (_, index) => {
        return { time: ((now.hour() + index + 1) % 24) + '.00', clicks: 0 };
      });

      for (const click of clicks) {
        const click_time = dayjs(click.clicked_at, 'YYYY-MM-DDTHH:mm:ss.ms[Z]');
        if (click_time.isAfter(hour_boundary)) {
          day.find((elem) => elem.time === click_time.hour() + '.00').clicks++;
        }
        // if (click_time.diff(now, "days") <= 6) {
        //   day[click_time.hour() + '.00']++;
        // }
      }
      setData({ day: day, week: [], month: [] }); //eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [clicks]);

  const isUpdating = useRef(false);
  useEffect(() => {
    const update = async () => {
      if (isUpdating.current) return false;
      isUpdating.current = true;
      setClicks(await getStats(short_code));
      return true;
    };
    void update();
  }, [getStats, short_code]);

  const timespans = [
    { value: 'day', label: 'Последние 24 часа' },
    { value: 'week', label: 'Последняя неделя' },
    { value: 'month', label: 'Последний месяц' },
  ];
  return (
    <>
      <div className="link-stats__dropdown-wrapper">
        <DropdownCard
          trigger={
            <button type="button" className="filter-pill-btn">
              <span className="material-symbols-outlined">sort</span>
              <span>{timespans.find((ts) => ts.value === timespan).label}</span>
            </button>
          }
        >
          <div className="dropdown-options-box">
            {timespans.map((option) => (
              <button
                key={option.label}
                type="button"
                className={`dropdown-option-item close-dropdown ${
                  option.value === timespan ? 'is-active' : ''
                }`}
                onClick={() => setTimespan(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </DropdownCard>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart responsive data={data[timespan]}>
          <Line dataKey="clicks" />
          <XAxis dataKey="time" />
          <YAxis dataKey="clicks" />
          <RechartsDevtools />
        </LineChart>
      </ResponsiveContainer>
    </>
  );
}
