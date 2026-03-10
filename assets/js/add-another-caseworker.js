document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('#caseworker-container')
  if (!container) return

  const max = parseInt(container.dataset.max, 10) || 5
  const blocks = container.querySelectorAll('.caseworker-block')
  const addButton = container.querySelector('[data-testid="addAnotherCaseWorker"]')

  function updateLegends() {
    const visibleBlocks = [...blocks].filter(block => !block.hidden)
    const visibleCount = visibleBlocks.length

    visibleBlocks.forEach((block, visibleIndex) => {
      const legend = block.querySelector('legend')
      if (!legend) return

      if (visibleCount === 1) {
        legend.textContent = 'Caseworker'
      } else {
        legend.textContent = `Caseworker ${visibleIndex + 1}`
      }
    })
  }

  function updateVisibilityAndButton() {
    let visibleCount = 0
    blocks.forEach(block => {
      if (!block.hidden) visibleCount += 1
    })

    if (addButton) {
      if (visibleCount >= max) {
        addButton.classList.add('govuk-visually-hidden')
      } else {
        addButton.classList.remove('govuk-visually-hidden')
      }
    }

    blocks.forEach(block => {
      const removeBtn = block.querySelector('.remove-caseworker')
      if (removeBtn) {
        if (visibleCount <= 1) {
          removeBtn.classList.add('govuk-visually-hidden')
        } else {
          removeBtn.classList.remove('govuk-visually-hidden')
        }
      }
    })
    syncInputHiddenState()
    updateLegends()
  }

  function addAnother() {
    for (const block of blocks) {
      if (block.hidden) {
        block.hidden = false
        const input = block.querySelector('input')
        if (input) input.focus()
        break
      }
    }
    updateVisibilityAndButton()
  }

  function removeBlock(btn) {
    const block = btn.closest('.caseworker-block')
    if (!block) return

    const input = block.querySelector('input')
    if (input) input.value = ''

    block.hidden = true
    updateVisibilityAndButton()
  }

  function syncInputHiddenState() {
    blocks.forEach(block => {
      const input = block.querySelector('input[data-testid="caseWorkerInput"]')
      if (!input) return

      if (block.hidden) {
        input.setAttribute('disabled', '')
        input.value = ''
      } else {
        input.removeAttribute('disabled')
      }
    })
  }

  if (addButton) {
    addButton.addEventListener('click', addAnother)
  }

  container.addEventListener('click', e => {
    if (e.target.matches('.remove-caseworker')) {
      e.preventDefault()
      removeBlock(e.target)
    }
  })

  updateVisibilityAndButton()
})
