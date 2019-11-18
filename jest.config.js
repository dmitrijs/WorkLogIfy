module.exports = {
    roots: ['<rootDir>/app'],
    transform: {
        "^.+\\.js$": "babel-jest",
        '^.+\\.tsx?$': 'ts-jest'
    },
};
