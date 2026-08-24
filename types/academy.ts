export type Row = Record<string, any>
export type Section = 'inicio'|'alumnos'|'inscripciones'|'talleres'|'maestros'|'pagos'|'gastos'|'finanzas'
export type ModalState = { type: string; row?: Row } | null
