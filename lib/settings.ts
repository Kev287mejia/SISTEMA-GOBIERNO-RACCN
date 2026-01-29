import { prisma } from "./prisma"

export async function getSetting(key: string, defaultValue: string = ""): Promise<string> {
    try {
        const setting = await prisma.systemSetting.findUnique({
            where: { key }
        })
        return setting?.value ?? defaultValue
    } catch (error) {
        console.error(`Error getting setting ${key}:`, error)
        return defaultValue
    }
}

export async function getSettingsByGroup(group: string) {
    try {
        const settings = await prisma.systemSetting.findMany({
            where: { group }
        })
        return settings.reduce((acc: any, curr) => {
            let value: any = curr.value
            if (curr.type === 'number') value = Number(curr.value)
            if (curr.type === 'boolean') value = curr.value === 'true'

            acc[curr.key] = value
            return acc
        }, {})
    } catch (error) {
        console.error(`Error getting settings for group ${group}:`, error)
        return {}
    }
}

export async function getAllSettings() {
    try {
        const settings = await prisma.systemSetting.findMany()
        return settings.reduce((acc: any, curr) => {
            let value: any = curr.value
            if (curr.type === 'number') value = Number(curr.value)
            if (curr.type === 'boolean') value = curr.value === 'true'

            acc[curr.key] = value
            return acc
        }, {})
    } catch (error) {
        console.error("Error getting all settings:", error)
        return {}
    }
}
