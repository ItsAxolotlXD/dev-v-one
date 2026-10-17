import React from 'react';
import { MailApp } from './mail/MailApp';
import { CalendarApp } from './calendar/CalendarApp';

interface ProductivityTabProps {
  kind: 'mail' | 'calendar';
  navigate?: (route: string) => void;
}

export function ProductivityTab({ kind, navigate }: ProductivityTabProps) {
  return (
    <div className="w-full h-full flex flex-col flex-1 overflow-hidden">
      {kind === 'mail' ? (
        <MailApp navigate={navigate} />
      ) : (
        <CalendarApp navigate={navigate} />
      )}
    </div>
  );
}
