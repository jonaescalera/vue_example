function newLatLong(x, y, z, relativeScale, referencePoint) {
	const earth = 6378.137; //radius of the earth in kilometer
    const pi = Math.PI;
    let cos = Math.cos;
    let m = 1 / (((2 * pi) / 360) * earth) / 1000; //1 meter in degree

    const newLongitude =
          referencePoint[1] +
          (y * relativeScale * m) /
            cos(referencePoint[0] * (pi / 180));

    const newLatitude =
        referencePoint[0] + x * relativeScale * m;
        
    return [newLatitude, newLongitude];
}

function addKmToLong(point, kms) {
    const earth = 6378.137;  //radius of the earth in kilometer
    const pi = Math.PI;
    const cos = Math.cos;
    const m = (1 / ((2 * pi / 360) * earth));  //1 km in degree

    const nw_longitude = point[0] + (kms * m) / cos(point[1] * (pi / 180));

    return nw_longitude;
}

function addKmToLat(point, kms) {
    const earth = 6378.137;  //radius of the earth in kilometer
    const pi = Math.PI;
    const m = (1 / ((2 * pi / 360) * earth));  //1 km in degree

    const nw_latitude = point[1]+ (kms * m);

    return nw_latitude;
}


export { 
	newLatLong,
    addKmToLong,
    addKmToLat
}