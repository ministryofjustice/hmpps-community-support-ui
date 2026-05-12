import { GovukFrontendSummaryList } from '@govuk-frontend'

export interface IcsSummaryRowsInput {
  formattedDate: string
  formattedTime: string
  methodDisplay: string
  reason?: string | null
  locationValue?: { text: string } | { html: string }
  personFirstName: string
  communicationsDisplay: string
}

export function buildIcsSummaryRows(input: IcsSummaryRowsInput): GovukFrontendSummaryList['rows'] {
  const { formattedDate, formattedTime, methodDisplay, reason, locationValue, personFirstName, communicationsDisplay } =
    input

  return [
    { key: { text: 'Date' }, value: { text: formattedDate } },
    { key: { text: 'Start time' }, value: { text: formattedTime } },
    { key: { text: 'Method' }, value: { text: methodDisplay } },
    ...(reason ? [{ key: { text: 'Reason session is not in-person' }, value: { text: reason } }] : []),
    ...(locationValue ? [{ key: { text: 'Location' }, value: locationValue }] : []),
    {
      key: { text: `How ${personFirstName} was informed about the session` },
      value: { text: communicationsDisplay },
    },
  ]
}

export function formatAddress(parts: {
  addressLine1?: string | null
  addressLine2?: string | null
  townOrCity?: string | null
  county?: string | null
  postcode?: string | null
}): string {
  return [parts.addressLine1, parts.addressLine2, parts.townOrCity, parts.county, parts.postcode]
    .filter(Boolean)
    .join('<br>')
}
