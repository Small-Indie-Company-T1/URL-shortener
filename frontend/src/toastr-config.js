import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import './styles/toastr-custom.css';

const configureToastr = () => {
  toastr.options = {
    closeButton: true,
    progressBar: true,
    positionClass: 'toast-top-center',
    timeOut: 4000,
    extendedTimeOut: 2000,
    showMethod: 'slideDown',
    hideMethod: 'slideUp',
    preventDuplicates: true,
    newestOnTop: false,
  };
};

export { configureToastr, toastr };
