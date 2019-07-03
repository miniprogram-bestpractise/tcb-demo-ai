
function getPathSegments(path) {
  const pathArray = path.split('.');
  const parts = [];

  for (let i = 0; i < pathArray.length; i++) {
    let p = pathArray[i];

    while (p[p.length - 1] === '\\' && pathArray[i + 1] !== undefined) {
      p = p.slice(0, -1) + '.';
      p += pathArray[++i];
    }

    parts.push(p);
  }

  return parts;
}

/** get() - from https://github.com/sindresorhus/dot-prop
* Get a property from a nested object using a dot path.
* 
* [object]
* Type: object
* Object to get, set, or delete the path value.
* 
* [path]
* Type: string
* Path of the property in the object, using . to separate each nested key.
* Use \\. if you have a . in the key.
 */
export function get(object, path) {
  const pathArray = getPathSegments(path);

  for (let i = 0; i < pathArray.length; i++) {
    if (!Object.prototype.propertyIsEnumerable.call(object, pathArray[i])) {
      return value;
    }

    object = object[pathArray[i]];

    if (object === undefined || object === null) {
      // `object` is either `undefined` or `null` so we want to stop the loop, and
      // if this is not the last bit of the path, and
      // if it did't return `undefined`
      // it would return `null` if `object` is `null`
      // but we want `get({foo: null}, 'foo.bar')` to equal `undefined`, or the supplied value, not `null`
      if (i !== pathArray.length - 1) {
        return value;
      }

      break;
    }
  }

  return object;
}

