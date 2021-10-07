const isAppleMobileDevice = () => {
	return true;
	return /iPad|ipad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
};

export {
	isAppleMobileDevice
};