class Filter {
  normalize = (filterData) => {
    const data = filterData.assetInfo.metadata.props    
    return {
      value: data.name,
      id: filterData.id
    };
  }
}

export default Filter;