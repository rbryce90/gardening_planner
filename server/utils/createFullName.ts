export default ({ firstName, lastName, middleName }: { firstName: string, lastName: string, middleName?: string }) => {
    if (middleName) {
        return `${firstName} ${middleName} ${lastName}`
    }
    return `${firstName} ${lastName}`
}