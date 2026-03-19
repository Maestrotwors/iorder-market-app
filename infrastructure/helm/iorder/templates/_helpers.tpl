{{/*
iOrder Market — Helm Template Helpers
*/}}

{{/*
Expand the name of the chart.
*/}}
{{- define "iorder.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "iorder.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Chart label
*/}}
{{- define "iorder.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "iorder.labels" -}}
helm.sh/chart: {{ include "iorder.chart" . }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: iorder-market
{{- end }}

{{/*
Selector labels for a specific service
Usage: {{ include "iorder.selectorLabels" (dict "service" "api-gateway" "context" .) }}
*/}}
{{- define "iorder.selectorLabels" -}}
app.kubernetes.io/name: {{ .service }}
app.kubernetes.io/instance: {{ .context.Release.Name }}
{{- end }}

{{/*
PostgreSQL connection URL
*/}}
{{- define "iorder.databaseUrl" -}}
{{- if .Values.postgresql.externalHost -}}
postgresql://{{ .Values.postgresql.username }}:{{ .Values.secrets.databasePassword }}@{{ .Values.postgresql.externalHost }}:{{ .Values.postgresql.port }}/{{ .Values.postgresql.database }}
{{- else -}}
postgresql://{{ .Values.postgresql.username }}:{{ .Values.secrets.databasePassword }}@{{ include "iorder.fullname" . }}-postgresql:{{ .Values.postgresql.port }}/{{ .Values.postgresql.database }}
{{- end -}}
{{- end }}

{{/*
RedPanda broker address
*/}}
{{- define "iorder.redpandaBrokers" -}}
{{ include "iorder.fullname" . }}-redpanda:{{ .Values.redpanda.kafka.port }}
{{- end }}
