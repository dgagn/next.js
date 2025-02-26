import { join } from 'path'
import { nonNullable } from './non-nullable'
import { promises } from 'fs'

export async function flatReaddir(dir: string, include: RegExp) {
  const dirents = await promises.readdir(dir, { withFileTypes: true })
  const result = await Promise.all(
    dirents.map(async (part) => {
      const absolutePath = join(dir, part.name)
      if (part.isSymbolicLink()) {
        const stats = await promises.stat(absolutePath)
        if (stats.isDirectory()) {
          return null
        }
      }

      if (part.isDirectory() || !include.test(part.name)) {
        return null
      }

      return absolutePath.replace(dir, '')
    })
  )

  return result.filter(nonNullable)
}
