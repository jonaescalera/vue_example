class File {
  normalize = data => {
    return {
      id: data.id,
      account: data.account && {
        id: data.account.id,
        href: data.account.href
      },
      href: data.self.href,
      name: data.name,
      preview: `data:image/png;base64,${data.data}`
    };
  };
  serialize = file => {
    return {
      account: file.account,
      name: file.name,
      properties: {}
    };
  };
}

export default new File();