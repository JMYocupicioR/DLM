# DeepLux - Matriz de Acceso y Reglas de Negocio

> Documento de referencia para el ecosistema de identidad y suscripciones.  
> Fuente de verdad para: tipos de usuario, apps permitidas, planes elegibles, requisitos de verificación.

---

## 1. Tipos de Usuario

| slug | Nombre | Requiere Cédula | Requiere Especialidad | Plan por defecto |
|------|--------|-----------------|----------------------|-----------------|
| `specialist` | Especialista Médico | Sí (cédula + especialidad) | Sí | suite-medica |
| `general_physician` | Médico General / Internista | Sí (cédula profesional) | No | profesional-basico |
| `resident` | Residente | Sí (carta de residencia) | Sí | profesional-basico |
| `intern` | Pasante de Servicio Social | No (carta de pasantía) | No | libre |
| `student` | Estudiante de Medicina | No (credencial universitaria) | No | libre |
| `researcher` | Investigador | Sí (cédula o credencial institucional) | No | investigador |
| `physiotherapist` | Fisioterapeuta / Rehabilitador | Sí (cédula profesional) | No | profesional-basico |
| `clinic_admin` | Administrador de Clínica | Sí (cédula director médico) | Depende | clinica-starter |
| `other` | Otro Profesional de la Salud | Opcional | No | profesional-basico |

---

## 2. Apps del Ecosistema

| slug | Nombre | Descripción | Audiencia |
|------|--------|-------------|-----------|
| `expediente-dlm` | Expediente-DLM | Expediente clínico electrónico (EHR) | individual + clinic |
| `toxina-dlm` | Toxina-DLM | Gestión de aplicaciones de toxina botulínica | individual + clinic |
| `escalas-dlm` | Escalas-DLM | Repositorio de escalas médicas y evaluaciones | individual + clinic |
| `cognitivapp-dlm` | CognitivApp-DLM | Rehabilitación cognitiva | individual + clinic |
| `physio-dlm` | Physio-DLM | Telerehabilitación y cursos CME | individual + clinic |
| `portal-3d` | Portal Manufactura 3D | Modelos 3D médicos y manufactura | clinic |

---

## 3. Planes y Acceso por App

### Planes Individuales

| Plan | Precio MXN/mes | Precio MXN/año | Escalas | Expediente | Toxina | CognitivApp | Physio | Portal3D |
|------|---------------|----------------|---------|-----------|--------|-------------|--------|----------|
| `libre` | $0 | $0 | ✅ Lectura | ❌ | ❌ | ❌ | ❌ | ❌ |
| `profesional-basico` | $299 | $2,990 | ✅ Completo | ✅ Completo | ❌ | ❌ | ❌ | ❌ |
| `suite-medica` | $599 | $5,990 | ✅ Completo | ✅ Completo | ✅ Completo | ✅ Completo | ✅ Completo | ❌ |
| `investigador` | $399 | $3,990 | ✅ + Export | ✅ + Export | ✅ Completo | ✅ Completo | ✅ Completo | ❌ |

### Planes para Clínicas

| Plan | Precio MXN/mes | Asientos | Escalas | Expediente | Toxina | CognitivApp | Physio | Portal3D |
|------|---------------|----------|---------|-----------|--------|-------------|--------|----------|
| `clinica-starter` | $899 | 3 | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `clinica-pro` | $2,499 | 10 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `clinica-enterprise` | Personalizado | Ilimitado | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 4. Trust Levels (Niveles de Confianza)

| Nivel | Nombre | Condición | Acceso |
|-------|--------|-----------|--------|
| 0 | Sin verificar | Registro completado | Solo EscalasDLM (lectura). Sin trial. |
| 1 | Email confirmado | Email verificado | Trial 14 días de todas las apps. |
| 2 | Documentos enviados | Cédula/documentos subidos | Acceso completo mientras se revisa. Badge "en proceso". |
| 3 | Verificado | Staff DeepLux aprobó | Acceso completo. Badge verificado. Puede recetar, exportar, CFDI. |

---

## 5. Requisitos de Verificación por Tipo

| Tipo de Usuario | Documentos Requeridos | Desbloqueado en |
|----------------|----------------------|-----------------|
| Especialista | Cédula profesional + Cédula especialidad | Trust Level 2→3 |
| Médico General | Cédula profesional | Trust Level 2→3 |
| Residente | Cédula profesional + Carta de sede | Trust Level 2→3 |
| Pasante | Carta institucional | Trust Level 2→3 (opcional) |
| Estudiante | Credencial universitaria | Trust Level 2→3 (opcional) |
| Investigador | Cédula o credencial institucional | Trust Level 2→3 |
| Fisioterapeuta | Cédula profesional | Trust Level 2→3 |
| Clínica | RFC + COFEPRIS + Cédula Director | Trust Level 2→3 |

---

## 6. Acciones Desbloqueadas por Trust Level

| Acción | Trust 0 | Trust 1 | Trust 2 | Trust 3 |
|--------|---------|---------|---------|---------|
| Ver escalas médicas | ✅ | ✅ | ✅ | ✅ |
| Usar trial apps | ❌ | ✅ | ✅ | ✅ |
| Crear expedientes | ❌ | ✅ (trial) | ✅ | ✅ |
| Emitir recetas | ❌ | ❌ | ⚠️ Limitado | ✅ |
| Exportar datos | ❌ | ❌ | ❌ | ✅ (plan inv.) |
| Solicitar CFDI | ❌ | ❌ | ❌ | ✅ |
| Perfil público | ❌ | ❌ | ⚠️ Sin badge | ✅ Con badge |
| Invitar equipo (clínica) | ❌ | ❌ | ✅ | ✅ |

---

## 7. Políticas de Ciclo de Vida de Suscripción

| Evento | Acción |
|--------|--------|
| Registro completado | Se crea suscripción `libre` o trial 14 días |
| Trial expirado sin pago | Degradar a `libre`, mostrar upsell |
| Pago exitoso | `status = active`, recomputar `user_product_access` |
| Fallo de pago | `status = past_due`, iniciar grace period (3 días) |
| Grace period vence | Modo read-only (7 días adicionales) |
| Sin pago en read-only | `status = expired`, suspender acceso |
| Pago durante past_due/read-only | Restaurar `active`, restablecer acceso |
| Cancelación solicitada | `cancel_at_period_end = true`, acceso hasta fin de período |
| Downgrade de plan | Efectivo al inicio del siguiente período |
| Upgrade de plan | Efectivo inmediato con prorrateo |

---

## 8. Reglas de Facturación México

| Campo | Regla |
|-------|-------|
| RFC | Validar formato: persona física (13 chars) o moral (12 chars) + homoclave |
| CURP | Validar formato: 18 caracteres según RENAPO |
| Régimen fiscal (SAT) | Dropdown con regímenes vigentes para 2025 |
| CFDI versión | 4.0 (requerida desde 2023) |
| Moneda default | MXN |
| Moneda alternativa | USD (para tarjetas internacionales vía Stripe) |
| Proveedor CFDI | Facturapi.io (recomendado) o SW SapienS |

---

## 9. Reglas de Upsell Contextual

| Situación | Mensaje | CTA |
|-----------|---------|-----|
| Usuario libre intenta usar Expediente | "Expediente-DLM incluido en Plan Profesional Básico" | "Ver Plan $299/mes" |
| Usuario Profesional Básico intenta usar Toxina | "Toxina-DLM incluido en Suite Médica" | "Actualizar a $599/mes" |
| Clínica Starter intenta usar Toxina | "Disponible en Clínica Pro" | "Ver Plan $2,499/mes" |
| Trial expirado | "Tu periodo de prueba terminó" | "Elige tu plan" |
| Trust 0 intenta crear expediente | "Confirma tu email para continuar" | "Reenviar correo" |
| Trust 1 quiere recetar | "Completa tu perfil profesional" | "Verificar cédula" |
