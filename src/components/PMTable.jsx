import React from 'react';
import PropTypes from 'prop-types';
import './PMStyle.css';

export default class PMTable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            caption: props.caption,
            header: props.header,
            data: props.data,
            sortby: null,
            descending: false,
            error: null,
            currentColumn: 1,
            searchTerm: '', // Estado para armazenar o termo de pesquisa
        };

        this.onClick = this.onClick.bind(this);
        this.handleNextColumn = this.handleNextColumn.bind(this);
        this.handlePreviousColumn = this.handlePreviousColumn.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
    }

    componentDidMount() {
        fetch('http://localhost:3000/horarios')
            .then(response => response.json())
            .then(json => {
                this.setState({
                    caption: json.caption,
                    header: json.header,
                    data: json.data
                });
            })
            .catch(error => {
                console.error(error);
                this.setState({ error: 'Não foi possível carregar os dados. Atualize a página e tente novamente.' });
            });
    }

    onClick(event) {
        const column = event.target.tagName.toUpperCase() === 'TH' ? event.target.cellIndex : -1;
        const data = Array.from(this.state.data);
        const descending = this.state.sortby === column && !this.state.descending;
        data.sort((a, b) => {
            if (a[column] === b[column]) {
                return 0;
            }
            return descending
                ? a[column] < b[column]
                    ? 1
                    : -1
                : a[column] > b[column]
                    ? 1
                    : -1;
        });
        this.setState({
            data,
            sortby: column,
            descending,
            edit: {
                row: -1,
                column: -1,
            }
        });
    }

    handleNextColumn() {
        this.setState(prevState => ({
            currentColumn: Math.min(prevState.currentColumn + 1, this.state.header.length - 1)
        }));
    }

    handlePreviousColumn() {
        this.setState(prevState => ({
            currentColumn: Math.max(prevState.currentColumn - 1, 1)
        }));
    }

    handleSearch(event) {
        this.setState({ searchTerm: event.target.value });
    }

    render() {
        if (this.state.error) {
            return <div>{this.state.error}</div>;
        }

        const { caption, header, data, searchTerm } = this.state;

        // Filtrar os dados com base no termo de pesquisa
        const filteredData = data.filter(row =>
            row.some(cell => typeof cell === 'string' && cell.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        const tableStyle = {
            border: '1px solid black',
            borderCollapse: 'collapse',
            width: '100%',
            textAlign: 'left',
            backgroundColor: '#f1f1f1',
        };

        const thStyle = {
            border: '1px solid black',
            padding: '10px',
            backgroundColor: '#ff6600',
            color: 'white',
        };

        const tdStyle = {
            border: '1px solid black',
            padding: '10px',
        };

        const captionStyle = {
            border: '1px solid black',
            padding: '10px',
            backgroundColor: 'gray',
            color: 'white',
            fontSize: '20px',
        };

        const inputStyle = {
            width: '100%', // Definir a largura como 100% da tabela
            boxSizing: 'border-box', // Garantir que a largura inclua padding e bordas
            padding: '8px', // Adicionar preenchimento para uma aparência melhor
            marginBottom: '10px', // Adicionar margem inferior para separação
        };

        return (
            <div>
                <input
                    type="text"
                    placeholder="Pesquisar matéria..."
                    value={searchTerm}
                    onChange={this.handleSearch}
                    style={inputStyle} // Aplicar o estilo à barra de pesquisa
                />

                <table style={tableStyle}>
                    <caption style={captionStyle}>{caption}</caption>
                    <thead onClick={this.onClick}>
                        <tr>
                            {header.map((title, idx) => {
                                const cellClass = (idx !== 0 && idx !== this.state.currentColumn) ? 'hide-on-mobile' : '';
                                return <th className={cellClass} style={thStyle} key={idx}>{title}</th>;
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((row, rowidx) => {
                            return (
                                <tr key={rowidx} data-row={rowidx}>
                                    {row.map((cell, columnidx) => {
                                        const cellClass = (columnidx !== 0 && columnidx !== this.state.currentColumn) ? 'hide-on-mobile' : '';
                                        return <td className={cellClass} style={tdStyle} key={columnidx}>{cell}</td>;
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td>
                                <button className="hide-on-desktop" onClick={this.handlePreviousColumn}>Anterior</button>
                                <button className="hide-on-desktop" onClick={this.handleNextColumn}>Próximo</button>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        );
    }
}

PMTable.propTypes = {
    caption: PropTypes.string.isRequired,
    header: PropTypes.array,
    data: PropTypes.array,
};

PMTable.defaultProps = {
    caption: 'Table',
    header: [],
    data: [],
};
