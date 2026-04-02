import createCrudApi from './_crud'

const crud = createCrudApi('/services/fwcore/freelists', {
  menuArr: false,
  batchDeleteUrl: '/services/fwcore/freelists/batch'
})

export const getPage = crud.getPage
export const submitForm = crud.submitForm
export const batchDelete = crud.batchDelete
