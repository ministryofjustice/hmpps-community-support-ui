import { Response } from 'express'
import { randomUUID } from 'node:crypto'
import { GovukFrontendCheckboxesItem, GovukFrontendErrorSummaryErrorListElement } from '@govuk-frontend'
import PersonNeedsPresenter, { personNeedsFormData } from './PersonNeedsPresenter'
import { WithConditional } from '../../@types/govukFrontend/derived'

describe('PersonNeedsPresenter', () => {
  const firstName = 'Alex'
  const lastName = 'Smith'

  const emptyForm = {
    referralId: randomUUID(),
    refereeName: { firstName, lastName },
  } as personNeedsFormData

  const fullForm = {
    referralId: randomUUID(),
    refereeName: { firstName, lastName },
    hasAccommodationNeeds: true,
    accommodationDetails: 'accommodation details',
    hasEmploymentEducationNeeds: true,
    employmentEducationDetails: 'employment details',
    hasFinancialNeeds: true,
    financialDetails: 'financial details',
    hasPersonalRelationshipsCommunityNeeds: true,
    personalRelationshipsCommunityDetails: 'personal relationship details',
    hasDrugUseNeeds: true,
    drugUseDetails: 'drug use details',
    hasAlcoholUseNeeds: true,
    alcoholUseDetails: 'alcohol use details',
    hasHealthWellbeingNeeds: true,
    healthWellbeingDetails: 'health and wellbeing details',
    hasThinkingBehavioursAttitudeNeeds: true,
    thinkingBehavioursAttitudeDetails: 'thinking, behaviour and attitude details',
  } as personNeedsFormData

  const allSelected = {
    referralId: randomUUID(),
    refereeName: { firstName, lastName },
    hasAccommodationNeeds: true,
    hasEmploymentEducationNeeds: true,
    hasFinancialNeeds: true,
    hasPersonalRelationshipsCommunityNeeds: true,
    hasDrugUseNeeds: true,
    hasAlcoholUseNeeds: true,
    hasHealthWellbeingNeeds: true,
    hasThinkingBehavioursAttitudeNeeds: true,
  } as personNeedsFormData

  const res = {
    locals: {
      content: {
        heading: `${firstName} ${lastName}`,
        hint: 'Select all that apply.',
        checkboxes: {
          accommodationLabel: 'Accommodation',
          accommodationHint: "Give details about {{ firstName }}'s accommodation needs",
          employmentLabel: 'Employment and education',
          employmentHint: "Give details about {{ firstName }}'s employment and education needs",
          financesLabel: 'Finances',
          financesHint: "Give details about {{ firstName }}'s finance needs",
          relationshipsLabel: 'Personal relationships and community',
          relationshipsHint: "Give details about {{ firstName }}'s personal relationships and community needs",
          drugUseLabel: 'Drug use',
          drugUseHint: "Give details about {{ firstName }}'s drug use needs",
          alcoholUseLabel: 'Alcohol use',
          alcoholUseHint: "Give details about {{ firstName }}'s alcohol use needs",
          healthLabel: 'Health and wellbeing',
          healthHint: "Give details about {{ firstName }}'s health and wellbeing needs",
          thinkingLabel: 'Thinking, behaviours and attitudes',
          thinkingHint: "Give details about {{ firstName }}'s thinking, behaviours and attitudes needs",
        },
        backLink: '/referral/task-list',
        submitHref: '/referral/task-list/select-person-needs',
        submitButton: 'Save and continue',
      },
    },
  } as unknown as Response

  const noErrors = {
    list: <GovukFrontendErrorSummaryErrorListElement[]>[],
    messages: {},
  }

  const emptyErrors = {
    list: <GovukFrontendErrorSummaryErrorListElement[]>[
      { href: '#accommodationInput', text: 'Enter details about the accommodation needs' },
      {
        href: '#employmentInput',
        text: 'Enter details about the employment and education needs',
      },
      {
        href: '#financesInput',
        text: 'Enter details about the finances needs',
      },
      {
        href: '#relationshipsInput',
        text: 'Enter details about the personal relationships and community needs',
      },
      {
        href: '#drugUseInput',
        text: 'Enter details about the drug use needs',
      },
      {
        href: '#alcoholUseInput',
        text: 'Enter details about the alcohol use needs',
      },
      {
        href: '#healthInput',
        text: 'Enter details about the health and wellbeing needs',
      },
      {
        href: '#thinkingInput',
        text: 'Enter details about the thinking, behaviours and attitudes needs',
      },
    ],
    messages: {
      accommodationInput: {
        text: 'Enter details about the accommodation needs',
      },
      employmentInput: {
        text: 'Enter details about the employment and education needs',
      },
      financesInput: {
        text: 'Enter details about the finances needs',
      },
      relationshipsInput: {
        text: 'Enter details about the personal relationships and community needs',
      },
      drugUseInput: {
        text: 'Enter details about the drug use needs',
      },
      alcoholUseInput: {
        text: 'Enter details about the alcohol use needs',
      },
      healthInput: {
        text: 'Enter details about the health and wellbeing needs',
      },
      thinkingInput: {
        text: 'Enter details about the thinking, behaviours and attitudes needs',
      },
    },
  }

  const checkTextArea = (
    html: string,
    name: string,
    expectedHint: string,
    expectedValue?: string | null,
    expectedError?: string | null,
  ): void => {
    expect(html).toContain(
      `<textarea class="govuk-textarea" id="${name}Input" name="${name}Input" type="text" rows="5" spellcheck="false" >${expectedValue || ''}</textarea>`,
    )
    if (expectedError) expect(html).toContain(`<span class="govuk-visually-hidden">Error:</span> ${expectedError}`)
    else expect(html).not.toContain('class="govuk-error-message"')
    expect(html).toContain(expectedHint)
  }

  const checkCheckbox = (
    checkbox: WithConditional<GovukFrontendCheckboxesItem>,
    name: string,
    expectedLabel: string,
    expectedHint: string,
    expectedChecked: boolean,
    expectedValue?: string | null,
    expectedError?: string | null,
  ): void => {
    expect(checkbox.value).toBe(name)
    expect(checkbox.text).toBe(expectedLabel)
    if (expectedChecked) expect(checkbox.checked).toBe(expectedChecked)
    else expect(checkbox.checked).toBeFalsy()
    expect(checkbox.conditional).not.toBeNull()
    checkTextArea(checkbox.conditional.html, name, expectedHint, expectedValue, expectedError)
  }

  test('builds correct view model', () => {
    const presenter = new PersonNeedsPresenter(emptyForm, noErrors)
    const viewModel = presenter.buildViewModel(res)

    expect(viewModel.backLink.href).toBe('/referral/task-list')
    expect(viewModel.heading).toBe('Alex Smith')
    expect(viewModel.checkboxes.hint.text).toBe('Select all that apply.')
    const [accommodation, employment, finances, relationships, drugUse, alcoholUse, health, thinking] =
      viewModel.checkboxes.items

    checkCheckbox(
      accommodation,
      'accommodation',
      'Accommodation',
      "Give details about Alex's accommodation needs",
      false,
    )
    checkCheckbox(
      employment,
      'employment',
      'Employment and education',
      "Give details about Alex's employment and education needs",
      false,
    )
    checkCheckbox(finances, 'finances', 'Finances', "Give details about Alex's finance needs", false, null)
    checkCheckbox(
      relationships,
      'relationships',
      'Personal relationships and community',
      "Give details about Alex's personal relationships and community needs",
      false,
    )
    checkCheckbox(drugUse, 'drugUse', 'Drug use', "Give details about Alex's drug use needs", false)
    checkCheckbox(alcoholUse, 'alcoholUse', 'Alcohol use', "Give details about Alex's alcohol use needs", false)
    checkCheckbox(
      health,
      'health',
      'Health and wellbeing',
      "Give details about Alex's health and wellbeing needs",
      false,
    )
    checkCheckbox(
      thinking,
      'thinking',
      'Thinking, behaviours and attitudes',
      "Give details about Alex's thinking, behaviours and attitudes needs",
      false,
    )

    expect(viewModel.submitButton.text).toBe('Save and continue')
    expect(viewModel.submitHref).toBe('/referral/task-list/select-person-needs')
  })

  test('builds correct view model with data', () => {
    const presenter = new PersonNeedsPresenter(fullForm, noErrors)
    const viewModel = presenter.buildViewModel(res)

    expect(viewModel.backLink.href).toBe('/referral/task-list')
    expect(viewModel.heading).toBe('Alex Smith')
    expect(viewModel.checkboxes.hint.text).toBe('Select all that apply.')
    const [accommodation, employment, finances, relationships, drugUse, alcoholUse, health, thinking] =
      viewModel.checkboxes.items

    checkCheckbox(
      accommodation,
      'accommodation',
      'Accommodation',
      "Give details about Alex's accommodation needs",
      true,
      'accommodation details',
    )
    checkCheckbox(
      employment,
      'employment',
      'Employment and education',
      "Give details about Alex's employment and education needs",
      true,
      'employment details',
    )
    checkCheckbox(
      finances,
      'finances',
      'Finances',
      "Give details about Alex's finance needs",
      true,
      'financial details',
    )
    checkCheckbox(
      relationships,
      'relationships',
      'Personal relationships and community',
      "Give details about Alex's personal relationships and community needs",
      true,
      'personal relationship details',
    )
    checkCheckbox(drugUse, 'drugUse', 'Drug use', "Give details about Alex's drug use needs", true, 'drug use details')
    checkCheckbox(
      alcoholUse,
      'alcoholUse',
      'Alcohol use',
      "Give details about Alex's alcohol use needs",
      true,
      'alcohol use details',
    )
    checkCheckbox(
      health,
      'health',
      'Health and wellbeing',
      "Give details about Alex's health and wellbeing needs",
      true,
      'health and wellbeing details',
    )
    checkCheckbox(
      thinking,
      'thinking',
      'Thinking, behaviours and attitudes',
      "Give details about Alex's thinking, behaviours and attitudes needs",
      true,
      'thinking, behaviour and attitude details',
    )

    expect(viewModel.submitButton.text).toBe('Save and continue')
    expect(viewModel.submitHref).toBe('/referral/task-list/select-person-needs')
  })

  test('builds correct view model with errors', () => {
    const presenter = new PersonNeedsPresenter(allSelected, emptyErrors)
    const viewModel = presenter.buildViewModel(res)

    expect(viewModel.backLink.href).toBe('/referral/task-list')
    expect(viewModel.heading).toBe('Alex Smith')
    expect(viewModel.checkboxes.hint.text).toBe('Select all that apply.')
    const [accommodation, employment, finances, relationships, drugUse, alcoholUse, health, thinking] =
      viewModel.checkboxes.items

    checkCheckbox(
      accommodation,
      'accommodation',
      'Accommodation',
      "Give details about Alex's accommodation needs",
      true,
      null,
      'Enter details about the accommodation needs',
    )
    checkCheckbox(
      employment,
      'employment',
      'Employment and education',
      "Give details about Alex's employment and education needs",
      true,
      null,
      'Enter details about the employment and education needs',
    )
    checkCheckbox(
      finances,
      'finances',
      'Finances',
      "Give details about Alex's finance needs",
      true,
      null,
      'Enter details about the finances needs',
    )
    checkCheckbox(
      relationships,
      'relationships',
      'Personal relationships and community',
      "Give details about Alex's personal relationships and community needs",
      true,
      null,
      'Enter details about the personal relationships and community needs',
    )
    checkCheckbox(
      drugUse,
      'drugUse',
      'Drug use',
      "Give details about Alex's drug use needs",
      true,
      null,
      'Enter details about the drug use needs',
    )
    checkCheckbox(
      alcoholUse,
      'alcoholUse',
      'Alcohol use',
      "Give details about Alex's alcohol use needs",
      true,
      null,
      'Enter details about the alcohol use needs',
    )
    checkCheckbox(
      health,
      'health',
      'Health and wellbeing',
      "Give details about Alex's health and wellbeing needs",
      true,
      null,
      'Enter details about the health and wellbeing needs',
    )
    checkCheckbox(
      thinking,
      'thinking',
      'Thinking, behaviours and attitudes',
      "Give details about Alex's thinking, behaviours and attitudes needs",
      true,
      null,
      'Enter details about the thinking, behaviours and attitudes needs',
    )

    expect(viewModel.submitButton.text).toBe('Save and continue')
    expect(viewModel.submitHref).toBe('/referral/task-list/select-person-needs')
  })
})
