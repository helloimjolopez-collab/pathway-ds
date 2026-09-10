// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40004059-1375
// source=components/sidenav/pathway-sidenav.js
// component=pathway-sidenav
//
// The HTML variant of the SideNav mapping, published under the "HTML" label so
// Figma Dev Mode offers a switcher: React teams see the JSX from
// sidenav-container.figma.ts, everyone else sees this custom element.
//
// WHY THIS MATTERS HERE: most tribes are on Radzen, Blazor, Angular or older
// libraries. A Dev Mode panel showing JSX tells them nothing they can use, and
// the observed result is that they rebuild the nav against their own component
// library and it drifts. <pathway-sidenav> is one HTML tag they can paste.
//
// There are deliberately NO html mappings for the child components. The custom
// element takes the whole nav tree through its `items` attribute and renders the
// children itself, so a consumer never writes an item, a section label or an
// indicator stripe by hand. Publishing child mappings would suggest otherwise.
//
// Slots are the exception, and they are why that holds. `items` covers
// everything item-SHAPED, so ten modules share one component by passing ten
// arrays. Slots cover what it cannot express - a module-specific widget, a
// usage meter, a support button - so a team needing one of those does not have
// to abandon the component and rebuild the nav.
import figma from 'figma'
const instance = figma.selectedInstance

// Every value of the Mode variant, per the exhaustive-mapping rule: an unmapped
// value silently returns undefined and renders as broken output.
const collapsed = instance.getEnum('Mode', {
  'Base': false,
  'Stroked': false,
  'Mobile.Base': false,
  'Mobile.Stroked': false,
  'Collapsed': true,
  'Collapsed.Stroked': true,
})

// Icons are Material Symbols ligature strings here rather than React
// components, which is what makes the nav expressible as a plain attribute.
const items = `[
    {"id":"giving-overview","label":"Overview","icon":"dashboard"},
    {"id":"giving-donations","label":"Donations","icon":"volunteer_activism","children":[
      {"id":"giving-batches","label":"Batches"},
      {"id":"giving-pledges","label":"Pledges"}
    ]},
    {"id":"giving-archive","label":"Archive","icon":"inventory_2","disabled":true}
  ]`

export default {
  example: figma.code`<!-- primitives first: the themes reference it via var() -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@helloimjolopez-pathway/pathway-tokens/dist/primitives.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@helloimjolopez-pathway/pathway-tokens/dist/themes/light.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@helloimjolopez-pathway/pathway-tokens/dist/motion.css">

<!-- fonts on the host page: document-scoped, so they reach inside the shadow root -->
<link href="https://fonts.googleapis.com/css2?family=Red+Hat+Text:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet">

<script type="module" src="https://cdn.jsdelivr.net/npm/@helloimjolopez-pathway/pathway-tokens/dist/pathway-sidenav.js"></script>

<pathway-sidenav
  active-id="giving-overview"${collapsed ? '\n  collapsed' : ''}
  items='${items}'>
  <!-- Slots, mirroring the slot structure in Figma. Ordinary HTML: these nodes
       stay in your document, so your CSS and your framework keep owning them.
       Omit any slot you do not need and it renders nothing at all. -->
  <span slot="header">Giving</span>
  <button slot="footer" type="button">Get support</button>
</pathway-sidenav>

<script>
  document.querySelector('pathway-sidenav')
    .addEventListener('pathway-navigate', e => console.log(e.detail.id));
</script>`,
  id: 'pathway-sidenav-html',
  metadata: { nestable: false },
}
