# Redox — ya incluido en el script unificado

**No copies** `google-apps-script-redox.gs` en Apps Script.

Todo el backend (Fosfato, Redox, intentos, consulta docente) está en un solo archivo:

**[`google-apps-script.gs`](./google-apps-script.gs)**

1. Abrí el spreadsheet → Extensiones → Apps Script.
2. Borrá el código viejo del proyecto.
3. Pegá **solo** el contenido completo de `google-apps-script.gs`.
4. Implementar → **Nueva implementación** del Web App.

Si pegás el fragmento Redox y el archivo completo a la vez, tendrás funciones duplicadas (`validarRedox`, `guardarRedox`, etc.) y el despliegue fallará.

## Crear la pestaña Redox

- El primer envío `tecnica: redox` crea la hoja automáticamente, o
- Ejecutá una vez en el editor: `setupRedoxSheets()` (definida al final de `google-apps-script.gs`).

Cabeceras fila 1:

```
timestamp | dni | alumno | muestra | ph | redox_n_tiosulfato | redox_n_ki3 | redox_peso_m1 | redox_acido_pct_m1 | redox_peso_m2 | redox_acido_pct_m2 | redox_vol_s2o3_1 | redox_vol_s2o3_2
```

## Validación opcional en Google Sheets

Fórmulas personalizadas (Datos → Validación de datos), fila 2 en adelante:

| Columna | Fórmula |
|---------|---------|
| DNI | `=Y(LEN(B2)>=7;LEN(B2)<=8;ESNUMERO(B2*1))` |
| pH | `=Y(D2>=0;D2<=14)` |
| Normalidad (E,F) | `=Y(E2>0;E2<=2)` |
| Peso (G,I) | `=Y(G2>0;G2<=10)` |
| % ascórbico (H,J) | `=Y(H2>=0;H2<=100)` |
| Volumen (K,L) | `=Y(K2>=0;K2<=200)` |
| % diff. volúmenes (M) | `=SI(Y(K2>0;L2>0);ABS(K2-L2)/((K2+L2)/2)*100;"")` |

Formato condicional en M (duplicado &gt; 0,5 %): `=Y(M2<>"";M2>0,5)`
