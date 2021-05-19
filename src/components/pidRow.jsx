/* License */
import React, {
    useRef,
    useState
} from 'react';
import Editable from 'zotero@components/editable';
import PropTypes from 'prop-types';

function PIDRow(props) {
    const textboxRef = useRef(null);
    const [selected, setSelected] = useState(false);
    const [value, setValue] = useState(props.item.getPID(props.type));

    function handleCancel() {
        setSelected(false);
    }

    function handleCommit(newPid, hasChanged) {
        if (hasChanged) {
            if (newPid && props.validate && !props.validate(props.type, newPid)) {
                return;
            }
            props.item.setPID(props.type, newPid, props.autosave)
            if (!props.autosave) setValue(props.item.getPID(props.type));
        }
        setSelected(false);
    }

    function handleEdit() {
        if (!props.editable) {
            return;
        }
        setSelected(true);
    }

    async function onFetch() {
        await props.item.fetchPID(props.type, props.autosave);
        if (!props.autosave) setValue(props.item.getPID(props.type));
    }

    return(
        <li>
            <label>
                {props.type.toUpperCase()}
            </label>
            <div className="editable-container">
                {/* Causes a warning, because Input uses componentWillReceiveProps
                which has been renamed and is not recommended. But won't show
                in non-strict mode because Zotero devs renamed it to UNSAFE_*/}
                <Editable
                    // There is a bug in Zotero's React Input component
                    // Its handleChange event is waiting for an options
                    // parameter from the child input element's onChange
                    // event. This is provided by the custom input element
                    // Autosuggest, but not by the regular HTML input.
                    // This doesn't happen with TextArea, because its
                    // handleChange doesn't expect an options parameter.
                    autoComplete={true}
                    // For the autoComplete workaround to work above,
                    // a getSuggestions function must be provided.
                    // Have it return an empty suggestions array.
                    getSuggestions={() => []}
                    // ...and a ref too
                    ref={textboxRef}
                    autoFocus
                    className={(props.editable && !selected) ? 'zotero-clicky' : ''}
                    isActive={selected}
                    isReadOnly={!props.editable}
                    onCancel={handleCancel}
                    onClick={handleEdit}
                    onCommit={handleCommit}
                    onFocus={handleEdit}
                    // onPaste={handlePaste}  // what happens if I paste multiline?
                    selectOnFocus={true}
                    value={value||''}
                />
            </div>
            <button
                onClick={() => onFetch()}
            >
                <img
                    height="18"
                    width="18"
                    title={`Fetch ${props.type}`}
                    src={`chrome://zotero/skin/arrow_refresh.png`}
                />
            </button>
        </li>
    );
}

PIDRow.propTypes = {
    autosave: PropTypes.bool,
    editable: PropTypes.bool,
    item: PropTypes.object, //instanceOf(ItemWrapper),
    type: PropTypes.string,
    validate: PropTypes.func
};

export default PIDRow;