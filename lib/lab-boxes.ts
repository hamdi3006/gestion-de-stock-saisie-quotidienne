import { productById } from '@/lib/lab-data'

export type BoxStatus = 'perte' | 'entamee' | 'stockee'

export type LabBox = {
  id: string
  roomId: string
  productId: string
  lot: string
  status: BoxStatus
  remaining: number
  previousRemaining?: number
}

export const BOX_STATUS_ORDER: Record<BoxStatus, number> = { perte: 0, entamee: 1, stockee: 2 }

export const LAB_BOXES: LabBox[] = [
  { id: 'b1', roomId: 'serologie', productId: 'hbs', lot: 'HB2407C', status: 'perte', remaining: 96, previousRemaining: 14 },
  { id: 'b2', roomId: 'serologie', productId: 'hiv', lot: 'HV1189', status: 'entamee', remaining: 38 },
  { id: 'b3', roomId: 'serologie', productId: 'crp', lot: 'CP5501', status: 'entamee', remaining: 12 },
  { id: 'b4', roomId: 'serologie', productId: 'hbs', lot: 'HB2407C', status: 'stockee', remaining: 96 },
  { id: 'b5', roomId: 'serologie', productId: 'hiv', lot: 'HV1189', status: 'stockee', remaining: 100 },

  { id: 'b6', roomId: 'biochimie', productId: 'glu', lot: 'GL1004', status: 'entamee', remaining: 320 },
  { id: 'b7', roomId: 'biochimie', productId: 'crea', lot: 'CR3321', status: 'entamee', remaining: 48 },
  { id: 'b8', roomId: 'biochimie', productId: 'glu', lot: 'GL1004', status: 'stockee', remaining: 500 },
  { id: 'b9', roomId: 'biochimie', productId: 'crea', lot: 'CR3321', status: 'stockee', remaining: 250 },

  { id: 'b10', roomId: 'hematologie', productId: 'nfs', lot: 'DL7790', status: 'perte', remaining: 1000, previousRemaining: 180 },
  { id: 'b11', roomId: 'hematologie', productId: 'nfs', lot: 'DL7781', status: 'entamee', remaining: 610 },
  { id: 'b12', roomId: 'hematologie', productId: 'nfs', lot: 'DL7790', status: 'stockee', remaining: 1000 },

  { id: 'b13', roomId: 'microbiologie', productId: 'gram', lot: 'GR4410', status: 'entamee', remaining: 155 },
  { id: 'b14', roomId: 'microbiologie', productId: 'gram', lot: 'GR4410', status: 'stockee', remaining: 200 },
  { id: 'b15', roomId: 'microbiologie', productId: 'gram', lot: 'GR4410', status: 'stockee', remaining: 200 },

  { id: 'b16', roomId: 'immunologie', productId: 'crp', lot: 'CP5501', status: 'perte', remaining: 50, previousRemaining: 9 },
  { id: 'b17', roomId: 'immunologie', productId: 'hiv', lot: 'HV1123', status: 'entamee', remaining: 72 },
  { id: 'b18', roomId: 'immunologie', productId: 'crp', lot: 'CP5501', status: 'stockee', remaining: 50 },

  { id: 'b19', roomId: 'hormonologie', productId: 'tsh', lot: 'TS0230', status: 'entamee', remaining: 48 },
  { id: 'b20', roomId: 'hormonologie', productId: 'tsh', lot: 'TS0217', status: 'entamee', remaining: 7 },
  { id: 'b21', roomId: 'hormonologie', productId: 'tsh', lot: 'TS0230', status: 'stockee', remaining: 100 },
]

export function sortBoxes(boxes: LabBox[]) {
  return [...boxes].sort((a, b) => {
    const byStatus = BOX_STATUS_ORDER[a.status] - BOX_STATUS_ORDER[b.status]
    if (byStatus !== 0) return byStatus
    const ratio = (box: LabBox) => box.remaining / (productById(box.productId)?.capacity ?? 1)
    return ratio(a) - ratio(b)
  })
}
