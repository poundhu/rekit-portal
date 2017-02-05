import React, { Component, PropTypes } from 'react';
import { browserHistory } from 'react-router';
import { autobind } from 'core-decorators';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Button, Col, Icon, Row } from 'antd';
import Convert from 'ansi-to-html';
import * as actions from './redux/actions';
import { getTestFilePattern } from './utils';

const convert = new Convert();

export class RunTestPage extends Component {
  static propTypes = {
    home: PropTypes.object.isRequired,
    rekitTools: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
  };

  componentDidMount() {
    this.checkAndRunTests(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.testFile !== this.props.params.testFile) {
      this.checkAndRunTests(nextProps);
    }
  }

  checkAndRunTests(props) {
    const rekitTools = this.props.rekitTools;
    if (rekitTools.currentTestFile !== props.params.testFile && !rekitTools.runTestRunning) {
      this.props.actions.runTest(props.params.testFile);
    }
  }

  @autobind
  handleTestButtonClick() {
    this.props.actions.runTest(this.props.params.testFile).catch((e) => {
      console.error('test failed: ', e);
    });
  }
  @autobind
  handleTestCoverageClick() {
    browserHistory.push('/tools/coverage');
  }

  render() {
    const output = this.props.rekitTools.runTestOutput || [];
    const runTestRunning = this.props.rekitTools.runTestRunning;
    return (
      <div className="rekit-tools-run-test-page">
        <h2><label>Run tests: </label>tests/{getTestFilePattern(this.props.params.testFile)}</h2>
        <Row>
          <Col span="16">
            <Button type="primary" disabled={runTestRunning} onClick={this.handleTestButtonClick}>
              {runTestRunning ? 'Running tests...' : 'Re-run tests'}
            </Button>
          </Col>
          <Col span="8" style={{ textAlign: 'right' }}>
            {!this.props.params.testFile && this.props.home.testCoverage &&
              <Button type="ghost" disabled={runTestRunning} onClick={this.handleTestCoverageClick}>
                <Icon type="pie-chart" />Test coverage
              </Button>}
          </Col>
        </Row>
        <hr />
        {!runTestRunning && !output.length && <div style={{ marginTop: 20 }}>Click run tests button to start the tests.</div>}
        {output.length > 0 &&
          <div className="output-container">
            <ul>
              {output.map((text, i) =>
                text && <li key={i} dangerouslySetInnerHTML={{ __html: convert.toHtml(text).replace(/color:#555/g, 'color:#777') }} />
              )}
            </ul>
          </div>
        }
      </div>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state) {
  return {
    home: state.home,
    rekitTools: state.rekitTools,
  };
}

/* istanbul ignore next */
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...actions }, dispatch)
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RunTestPage);
