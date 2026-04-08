import { useState } from 'react';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import useLinks from '../../hooks/useLinks.js';

export default function CreateTab() {
  const { isLoading, error, create, clearError } = useLinks();
  const [link, setLink] = useState('');
  const [shortLink, setShortLink] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const new_link = await create(link);
    if (new_link) setShortLink(`localhost:5173/${new_link}`);
    else setShortLink('');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shortLink);
      toastr.success('Ссылка скопирована в буфер обмена.');
    } catch (error) {
      console.error(error);
      toastr.error(
        'Не удалось скопировать ссылку. Попробуйте вручную.',
        'Ошибка'
      );
    }
  };

  return (
    <div>
      <h1>Создать ссылку</h1>
      <form onSubmit={handleSubmit}>
        <fieldset disabled={isLoading}>
          <input
            type="text"
            placeholder="Введите URL"
            value={link}
            onChange={(e) => {
              setLink(e.target.value);
              clearError();
            }}
          />
          <button type="submit">Создать</button>
        </fieldset>
      </form>
      <p>Your link:</p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <textarea placeholder="Сокращённая ссылка" value={shortLink} readOnly />
      <button onClick={handleCopyLink}>{'Copy'}</button>
    </div>
  );
}
