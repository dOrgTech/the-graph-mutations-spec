import faker from 'faker/locale/en_US'

export const getRandomName = () => {
    return faker.name.findName()
}

export const getRandomProfilePic = ( name ) => {
    return "https://i.pravatar.cc/350?u="+name
}