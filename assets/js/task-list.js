document.querySelectorAll('a.task-list-entry-link-disabled').forEach(link => {
  link.setAttribute('aria-disabled', 'true')
  link.addEventListener('click', event => event.preventDefault())
})
