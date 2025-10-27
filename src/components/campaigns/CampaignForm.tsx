'use client';

import { useState, FormEvent } from 'react';
import Image from 'next/image';
import type { Campaign } from '@/lib/campaignService';

interface CampaignFormProps {
  campaign?: Campaign;
  onSubmit: (data: Partial<Campaign>) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

export function CampaignForm({ campaign, onSubmit, onCancel, isEditing = false }: CampaignFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: campaign?.name || '',
    type: campaign?.type || 'download_gate',
    active: campaign?.active ?? false,
    triggerEvent: campaign?.trigger.event || 'pdf_downloaded',
    triggerThreshold: campaign?.trigger.threshold || 3,
    weight: campaign?.weight || 1,
    headline: campaign?.content.headline || '',
    description: campaign?.content.description || '',
    imageUrl: campaign?.content.imageUrl || '',
    imageAlt: campaign?.content.imageAlt || '',
    ctaText: campaign?.content.ctaText || '',
    dismissText: campaign?.content.dismissText || '',
    thankYouHeadline: campaign?.content.thankYouHeadline || 'Velkommen!',
    thankYouDescription: campaign?.content.thankYouDescription || 'Sjekk innboksen din for å bekrefte abonnementet.',
    thankYouButtonText: campaign?.content.thankYouButtonText || 'Ta meg til tegningen',
    buttonPulse: campaign?.styling?.buttonPulse ?? false,
    featureFlagKey: campaign?.featureFlagKey || '',
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Construct campaign data
      const campaignData: Partial<Campaign> = {
        name: formData.name,
        type: formData.type as Campaign['type'],
        active: formData.active,
        trigger: {
          event: formData.triggerEvent as Campaign['trigger']['event'],
          threshold: formData.triggerThreshold,
        },
        content: {
          headline: formData.headline,
          description: formData.description,
          imageUrl: formData.imageUrl || undefined,
          imageAlt: formData.imageAlt || undefined,
          ctaText: formData.ctaText,
          dismissText: formData.dismissText,
          thankYouHeadline: formData.thankYouHeadline || undefined,
          thankYouDescription: formData.thankYouDescription || undefined,
          thankYouButtonText: formData.thankYouButtonText || undefined,
        },
        styling: {
          buttonPulse: formData.buttonPulse,
        },
        weight: formData.weight,
        featureFlagKey: formData.featureFlagKey || undefined,
      };

      await onSubmit(campaignData);
    } catch (err) {
      console.error('Form submission error:', err);
      setError(err instanceof Error ? err.message : 'Noe gikk galt');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-medium">Feil ved lagring</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">Grunnleggende informasjon</h2>

        {/* Campaign Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Kampanjenavn *
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="F.eks: 3rd Download Gate"
          />
          <p className="mt-1 text-sm text-gray-500">
            Internt navn for kampanjen (vises ikke til brukere)
          </p>
        </div>

        {/* Active Toggle */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">Aktiv kampanje</span>
              <p className="text-sm text-gray-500">
                Aktiver eller deaktiver kampanjen. Inaktive kampanjer vises ikke til brukere.
              </p>
            </div>
          </label>
        </div>

        {/* Campaign Type */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
            Kampanjetype *
          </label>
          <select
            id="type"
            required
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="download_gate">Download Gate</option>
            <option value="exit_intent" disabled>
              Exit Intent (kommer snart)
            </option>
            <option value="scroll" disabled>
              Scroll (kommer snart)
            </option>
            <option value="other" disabled>
              Annet (kommer snart)
            </option>
          </select>
          <p className="mt-1 text-sm text-gray-500">
            Type popup-kampanje. Kun Download Gate er tilgjengelig nå.
          </p>
        </div>
      </div>

      {/* Trigger Settings */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">Trigger-innstillinger</h2>

        {/* Trigger Event */}
        <div>
          <label htmlFor="triggerEvent" className="block text-sm font-medium text-gray-700 mb-2">
            Trigger-hendelse *
          </label>
          <select
            id="triggerEvent"
            required
            value={formData.triggerEvent}
            onChange={(e) => setFormData({ ...formData, triggerEvent: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="pdf_downloaded">PDF nedlastet</option>
            <option value="exit_intent" disabled>
              Exit intent (kommer snart)
            </option>
            <option value="scroll_50_percent" disabled>
              Scroll 50% (kommer snart)
            </option>
          </select>
        </div>

        {/* Trigger Threshold */}
        <div>
          <label htmlFor="triggerThreshold" className="block text-sm font-medium text-gray-700 mb-2">
            Trigger-terskel * <span className="text-gray-500 font-normal">(hvilket nedlastingsnummer)</span>
          </label>
          <input
            type="number"
            id="triggerThreshold"
            required
            min="1"
            value={formData.triggerThreshold}
            onChange={(e) => setFormData({ ...formData, triggerThreshold: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-1 text-sm text-gray-500">
            <strong>Terskel betyr:</strong> Ved hvilken nedlastning skal popup vises? F.eks. "3" betyr at popup vises når brukeren laster ned sin 3. tegning.
          </p>
        </div>

        {/* Weight */}
        <div>
          <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
            Vekt * <span className="text-gray-500 font-normal">(for A/B testing)</span>
          </label>
          <input
            type="number"
            id="weight"
            required
            min="1"
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-1 text-sm text-gray-500">
            <strong>Vekt betyr prosentvis visning:</strong> Hvis du har to kampanjer med vekt 3 og 7, vil de vises 30% og 70% av tiden.
            Eksempel: Vekt 3 + Vekt 7 = 30% og 70% fordeling.
          </p>
        </div>
      </div>

      {/* Popup Content */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">Popup-innhold</h2>

        {/* Headline */}
        <div>
          <label htmlFor="headline" className="block text-sm font-medium text-gray-700 mb-2">
            Overskrift *
          </label>
          <input
            type="text"
            id="headline"
            required
            value={formData.headline}
            onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="F.eks: 🎉 Du har lastet ned 3 tegninger!"
          />
          <p className="mt-1 text-sm text-gray-500">
            Stor overskrift som vises øverst i popup
          </p>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Beskrivelse *
          </label>
          <textarea
            id="description"
            required
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="F.eks: Få 10 bonus tegninger hver 14. dag"
          />
          <p className="mt-1 text-sm text-gray-500">
            Beskrivende tekst som forklarer tilbudet
          </p>
        </div>

        {/* Image URL */}
        <div className="pt-4 border-t border-gray-200">
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
            Bilde URL <span className="text-gray-500 font-normal">(valgfritt)</span>
          </label>
          <input
            type="url"
            id="imageUrl"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://cdn.sanity.io/images/..."
          />
          <p className="mt-1 text-sm text-gray-500">
            Kopier bilde-URL fra Sanity Studio → Pop-up bilder. Bildet vises mellom beskrivelsen og skjemaet.
          </p>
        </div>

        {/* Hidden Image Alt Text Field */}
        <div>
          <label htmlFor="imageAlt" className="block text-sm font-medium text-gray-700 mb-2">
            Bilde Alt-tekst <span className="text-gray-500 font-normal">(valgfritt - kopier fra Sanity)</span>
          </label>
          <input
            type="text"
            id="imageAlt"
            value={formData.imageAlt}
            onChange={(e) => setFormData({ ...formData, imageAlt: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="F.eks: Illustrasjon av bonus tegninger"
          />
          <p className="mt-1 text-sm text-gray-500">
            Kopier alt-tekst fra samme bilde i Sanity Studio for tilgjengelighet.
          </p>
        </div>

        {/* Live Popup Preview */}
        {(formData.headline || formData.description || formData.ctaText || formData.dismissText) && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-4">📱 Live forhåndsvisning av popup:</p>

            {/* Preview Container - Mimics the actual popup */}
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md mx-auto overflow-hidden">
                {/* Popup Content */}
                <div className="px-6 pt-6 pb-4 sm:p-8">
                  <div className="text-center">
                    {/* Headline Preview */}
                    {formData.headline && (
                      <h2 className="text-2xl sm:text-3xl font-bold text-[#264653] mb-3">
                        {formData.headline}
                      </h2>
                    )}

                    {/* Description Preview */}
                    {formData.description && (
                      <p className="text-base sm:text-lg text-gray-600 mb-6">
                        {formData.description}
                      </p>
                    )}

                    {/* Image Preview */}
                    {formData.imageUrl && (
                      <figure className="w-full max-w-sm mx-auto mb-6">
                        <Image
                          src={formData.imageUrl}
                          alt={formData.imageAlt || 'Kampanjebilde forhåndsvisning'}
                          width={400}
                          height={300}
                          className="w-full h-auto"
                          onError={() => {
                            // Silently handle error - invalid URL
                          }}
                        />
                      </figure>
                    )}

                    {/* Form Preview (non-functional, just visual) */}
                    <div className="space-y-4">
                      {/* Email Input Preview */}
                      <input
                        type="email"
                        placeholder="din@epost.no"
                        disabled
                        className="w-full py-2 px-4 border-2 border-[#2EC4B6] rounded-md placeholder:text-[#264653]/70 bg-white"
                        style={{
                          color: '#264653',
                          borderColor: '#2EC4B6',
                          outline: 'none',
                          boxShadow: 'none',
                        }}
                      />

                      {/* Buttons Preview */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        {/* CTA Button Preview */}
                        {formData.ctaText && (
                          <button
                            type="button"
                            disabled
                            className={`flex-1 inline-flex justify-center items-center rounded-lg px-4 py-3 text-base font-medium transition-all duration-200 bg-[#2EC4B6] text-white ${
                              formData.buttonPulse ? 'animate-pulse-subtle' : ''
                            }`}
                          >
                            {formData.ctaText}
                          </button>
                        )}

                        {/* Dismiss Button Preview */}
                        {formData.dismissText && (
                          <button
                            type="button"
                            disabled
                            className="inline-flex justify-center items-center rounded-lg border border-gray-300 shadow-sm px-4 py-3 bg-white text-base font-medium text-gray-700"
                          >
                            {formData.dismissText}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Preview */}
                <div className="bg-gray-50 px-6 py-3 text-center">
                  <p className="text-xs text-gray-500">
                    Vi respekterer personvernet ditt. Du kan melde deg av når som helst.
                  </p>
                </div>
              </div>
            </div>

            {/* Preview Warnings */}
            <div className="mt-3 space-y-1">
              {formData.imageUrl && !formData.imageAlt && (
                <p className="text-xs text-amber-600">
                  ⚠️ Husk å legge til alt-tekst for tilgjengelighet
                </p>
              )}
              {formData.buttonPulse && (
                <p className="text-xs text-blue-600">
                  ✨ Puls-animasjon er aktivert på CTA-knappen
                </p>
              )}
            </div>
          </div>
        )}

        {/* CTA Button Text */}
        <div>
          <label htmlFor="ctaText" className="block text-sm font-medium text-gray-700 mb-2">
            Knappetekst (CTA) *
          </label>
          <input
            type="text"
            id="ctaText"
            required
            value={formData.ctaText}
            onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="F.eks: Send meg tegninger!"
          />
          <p className="mt-1 text-sm text-gray-500">
            Tekst på hovedknappen (submit-knappen)
          </p>
        </div>

        {/* Dismiss Button Text */}
        <div>
          <label htmlFor="dismissText" className="block text-sm font-medium text-gray-700 mb-2">
            Avvis-knappetekst *
          </label>
          <input
            type="text"
            id="dismissText"
            required
            value={formData.dismissText}
            onChange={(e) => setFormData({ ...formData, dismissText: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="F.eks: Nei takk"
          />
          <p className="mt-1 text-sm text-gray-500">
            Tekst på avvis-knappen (lukk popup uten å sende inn)
          </p>
        </div>

        {/* Button Pulse Animation Toggle */}
        <div className="pt-4 border-t border-gray-200">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.buttonPulse}
              onChange={(e) => setFormData({ ...formData, buttonPulse: e.target.checked })}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">Aktiver puls-animasjon på CTA-knappen</span>
              <p className="text-sm text-gray-500">
                Subtil puls-effekt som trekker oppmerksomhet til knappen. Nyttig for A/B testing av konverteringsrater.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Thank You Page */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Takk-side (etter e-postinnsending)</h2>
          <p className="text-sm text-gray-500 mt-1">
            Innholdet som vises etter at brukeren har sendt inn e-posten sin
          </p>
        </div>

        {/* Thank You Headline */}
        <div>
          <label htmlFor="thankYouHeadline" className="block text-sm font-medium text-gray-700 mb-2">
            Takk-overskrift
          </label>
          <input
            type="text"
            id="thankYouHeadline"
            value={formData.thankYouHeadline}
            onChange={(e) => setFormData({ ...formData, thankYouHeadline: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="F.eks: Velkommen!"
          />
          <p className="mt-1 text-sm text-gray-500">
            Overskrift som vises etter vellykket innsending
          </p>
        </div>

        {/* Thank You Description */}
        <div>
          <label htmlFor="thankYouDescription" className="block text-sm font-medium text-gray-700 mb-2">
            Takk-beskrivelse
          </label>
          <textarea
            id="thankYouDescription"
            rows={2}
            value={formData.thankYouDescription}
            onChange={(e) => setFormData({ ...formData, thankYouDescription: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="F.eks: Sjekk innboksen din for å bekrefte abonnementet."
          />
          <p className="mt-1 text-sm text-gray-500">
            Instruksjon til brukeren om hva de skal gjøre videre
          </p>
        </div>

        {/* Thank You Button Text */}
        <div>
          <label htmlFor="thankYouButtonText" className="block text-sm font-medium text-gray-700 mb-2">
            Knappetekst for nedlasting
          </label>
          <input
            type="text"
            id="thankYouButtonText"
            value={formData.thankYouButtonText}
            onChange={(e) => setFormData({ ...formData, thankYouButtonText: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="F.eks: Ta meg til tegningen"
          />
          <p className="mt-1 text-sm text-gray-500">
            Tekst på knappen som åpner den nedlastede tegningen
          </p>
        </div>

        {/* Live Thank You Page Preview */}
        {(formData.thankYouHeadline || formData.thankYouDescription || formData.thankYouButtonText) && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-4">📱 Live forhåndsvisning av takk-side:</p>

            {/* Preview Container */}
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md mx-auto overflow-hidden">
                {/* Thank You Page Content */}
                <div className="px-6 pt-6 pb-4 sm:p-8">
                  <div className="text-center">
                    <div className="py-4 space-y-6">
                      <div>
                        {/* Success Checkmark */}
                        <div className="text-green-600 text-4xl mb-3">✓</div>

                        {/* Thank You Headline Preview */}
                        {formData.thankYouHeadline && (
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {formData.thankYouHeadline}
                          </h3>
                        )}

                        {/* Thank You Description Preview */}
                        {formData.thankYouDescription && (
                          <p className="text-sm text-gray-600">
                            {formData.thankYouDescription}
                          </p>
                        )}
                      </div>

                      {/* Download Button Preview */}
                      {formData.thankYouButtonText && (
                        <button
                          type="button"
                          disabled
                          className="w-full inline-flex justify-center items-center rounded-lg shadow-lg px-8 py-4 bg-[#2EC4B6] text-lg font-bold text-white"
                        >
                          {formData.thankYouButtonText}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Preview */}
                <div className="bg-gray-50 px-6 py-3 text-center">
                  <p className="text-xs text-gray-500">
                    Vi respekterer personvernet ditt. Du kan melde deg av når som helst.
                  </p>
                </div>
              </div>
            </div>

            {/* Preview Info */}
            <div className="mt-3">
              <p className="text-xs text-gray-600">
                💡 Dette er hvordan takk-siden ser ut etter at brukeren har sendt inn e-posten sin
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Settings */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">Avanserte innstillinger</h2>

        {/* PostHog Feature Flag Key */}
        <div>
          <label htmlFor="featureFlagKey" className="block text-sm font-medium text-gray-700 mb-2">
            PostHog Feature Flag Key <span className="text-gray-500 font-normal">(valgfritt, ikke aktiv ennå)</span>
          </label>
          <input
            type="text"
            id="featureFlagKey"
            value={formData.featureFlagKey}
            onChange={(e) => setFormData({ ...formData, featureFlagKey: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="F.eks: lead-campaign-3rd-download"
          />
          <p className="mt-1 text-sm text-gray-500">
            Klar for fremtidig bruk: PostHog feature flag for å slå kampanjen av/på eksternt. La stå tom hvis du ikke bruker dette.
          </p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Avbryt
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          )}
          {loading ? 'Lagrer...' : isEditing ? 'Oppdater kampanje' : 'Opprett kampanje'}
        </button>
      </div>
    </form>
  );
}
