export function FlattenField(fieldData = []) {
    return fieldData.reduce((acc, field) => {
      acc[field.name] = field.values?.[0] ?? '';
      return acc;
    }, {});
  }