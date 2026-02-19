const MAX_CASEWORKERS = 5

function renumberCaseworkers() {
  const items = document.querySelectorAll('.moj-add-another__item')
  const showNumbers = items.length > 1

  items.forEach((item, index) => {
    const legend = item.querySelector('.moj-add-another__title')

    if (!legend) return

    if (showNumbers) {
      legend.textContent = `Caseworker ${index + 1}`
    } else {
      legend.textContent = 'Caseworker'
    }

    const addButton = document.querySelector('.moj-add-another__add-button')
    if (addButton) {
      if (items.length >= MAX_CASEWORKERS) {
        addButton.classList.add('govuk-visually-hidden')
      } else {
        addButton.classList.remove('govuk-visually-hidden')
      }
    }
  })
}

document.addEventListener('DOMContentLoaded', () => {
  renumberCaseworkers()

  // Listen for add/remove actions created by MOJ module
  document.body.addEventListener('click', e => {
    if (e.target.closest('.moj-add-another__add-button') || e.target.closest('.moj-add-another__remove-button')) {
      // let the component update the DOM first
      setTimeout(renumberCaseworkers, 0)
    }
  })
})
