"use client";

/**
 * GuidancePreview Component
 *
 * Live preview of the artifact being built during guidance.
 * Shows entities, fields, and rules as they're defined.
 */

import { Database, FileText, Zap, Box, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ArtifactBase, Entity } from "@/types/artifact";
import type { GuidancePhase, DetectedContext } from "@/types/guidance";
import { GUIDANCE_PHASES } from "@/types/guidance";

interface GuidancePreviewProps {
  artifact: Partial<ArtifactBase>;
  phase: GuidancePhase;
  detectedContext: DetectedContext | null;
}

export function GuidancePreview({
  artifact,
  phase,
  detectedContext,
}: GuidancePreviewProps) {
  const entities = artifact.entities || [];
  const rules = artifact.rules || [];
  const totalFields = entities.reduce((sum, e) => sum + (e.fields?.length || 0), 0);

  const isEmpty = !artifact.toolName && entities.length === 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="font-semibold text-foreground">
          {artifact.toolName || "Ton outil"}
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          {GUIDANCE_PHASES[phase].description}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-3 border-b">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Progression</span>
          <span>{GUIDANCE_PHASES[phase].progress}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${GUIDANCE_PHASES[phase].progress}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {isEmpty ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {/* Detected Context */}
            {detectedContext && (
              <ContextBadge context={detectedContext} />
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              <StatCard
                icon={Database}
                label="Entites"
                value={entities.length}
              />
              <StatCard
                icon={FileText}
                label="Champs"
                value={totalFields}
              />
              <StatCard
                icon={Zap}
                label="Regles"
                value={rules.length}
              />
            </div>

            {/* Entities List */}
            {entities.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Structure des donnees
                </h3>
                <div className="space-y-2">
                  {entities.map((entity, index) => (
                    <EntityCard key={index} entity={entity} />
                  ))}
                </div>
              </div>
            )}

            {/* Rules List */}
            {rules.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Regles metier
                </h3>
                <div className="space-y-2">
                  {rules.map((rule, index) => (
                    <div
                      key={index}
                      className="p-2 rounded-lg bg-muted/50 text-xs"
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-amber-500">Si</span>
                        <span className="text-foreground">{rule.condition}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-green-500">Alors</span>
                        <span className="text-foreground">{rule.action}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
        <Box className="w-6 h-6 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">
        Commence a decrire ton outil pour voir l'apercu ici
      </p>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
}) {
  return (
    <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
      <Icon className="w-4 h-4 text-muted-foreground mb-1" />
      <span className="text-lg font-semibold text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function ContextBadge({ context }: { context: DetectedContext }) {
  const domainLabels: Record<string, string> = {
    crm: "CRM / Contacts",
    project: "Gestion de projet",
    inventory: "Inventaire / Stock",
    finance: "Finance / Budget",
    hr: "Ressources humaines",
    booking: "Reservations",
    ecommerce: "E-commerce",
    support: "Support / Tickets",
    events: "Evenements",
    education: "Formation",
    custom: "Personnalise",
  };

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
      <span className="text-xs text-muted-foreground">Domaine detecte:</span>
      <span className="text-xs font-medium text-primary">
        {domainLabels[context.domain] || context.domain}
      </span>
      {context.confidence > 0.7 && (
        <span className="text-xs text-green-600">Haute confiance</span>
      )}
    </div>
  );
}

function EntityCard({ entity }: { entity: Entity }) {
  const fieldCount = entity.fields?.length || 0;

  return (
    <div className="p-3 rounded-lg border bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm text-foreground">
            {entity.name}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {fieldCount} champ{fieldCount > 1 ? "s" : ""}
        </span>
      </div>

      {entity.fields && entity.fields.length > 0 && (
        <div className="mt-2 pl-6 space-y-1">
          {entity.fields.slice(0, 5).map((field, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-xs text-muted-foreground"
            >
              <ChevronRight className="w-3 h-3" />
              <span>{field.name}</span>
              <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                {field.type}
              </span>
            </div>
          ))}
          {entity.fields.length > 5 && (
            <div className="text-xs text-muted-foreground pl-5">
              +{entity.fields.length - 5} autres...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
