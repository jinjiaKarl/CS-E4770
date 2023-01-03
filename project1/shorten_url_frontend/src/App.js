import { useState } from 'react'
import axios from 'axios'
//const baseURL = '/api/v1'

function App() {
  const [url, setUrl] = useState('')
  const [showUrl, setShowUrl] = useState('')
  const [shortUrl, setShortUrl] = useState('')
  const [targetUrl, setTargetUrl] = useState('')
  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await axios.post(`/shorten`, {url})
    const surl = res.data.url
    setShortUrl(surl)
    setTargetUrl(surl)
    setShowUrl(url)
    //surl.lastIndexOf('/') > 0 && setTargetUrl(surl.substring(0, surl.lastIndexOf('/')) + baseURL + surl.substring(surl.lastIndexOf('/')))
  }
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <fieldset style={{width: "500px"}}>
        <div>
          My URL shortener!
        </div>
        <div>
          <input type="text" style={{width: "400px"}} value={url} onChange={(e) => setUrl(e.target.value)} />
        </div>
        <div>
          <button type="submit">Shorten!</button>
        </div>
        </fieldset>
      </form>
      {shortUrl && <p><a href={url}>{showUrl}</a> is now at <a href={targetUrl}>{shortUrl}</a></p>}
    </div>
  );
}


export default App;
