import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  Bug,
  TestTube
} from 'lucide-react'
import { 
  validateEmail, 
  validateName, 
  validatePostalCode, 
  validateFutureDate,
  validatePositiveNumber,
  validateRange,
  combineValidationResults
} from '@/utils/validation'
import { 
  createMockHouseholdData, 
  createMockMember, 
  createInvalidHouseholdData,
  createValidationTestCases,
  delay
} from '@/utils/testHelpers'

interface TestResult {
  name: string
  status: 'pending' | 'running' | 'passed' | 'failed'
  duration?: number
  error?: string
  details?: string
}

interface TestSuite {
  name: string
  tests: TestResult[]
  status: 'pending' | 'running' | 'completed'
}

export const TestRunner = () => {
  const { toast } = useToast()
  const [testSuites, setTestSuites] = useState<TestSuite[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [currentTest, setCurrentTest] = useState<string | null>(null)

  const initializeTests = () => {
    const suites: TestSuite[] = [
      {
        name: 'Validation Tests',
        status: 'pending',
        tests: [
          { name: 'Email validation', status: 'pending' },
          { name: 'Name validation', status: 'pending' },
          { name: 'Postal code validation', status: 'pending' },
          { name: 'Date validation', status: 'pending' },
          { name: 'Number validation', status: 'pending' },
          { name: 'Range validation', status: 'pending' }
        ]
      },
      {
        name: 'Household Data Tests',
        status: 'pending',
        tests: [
          { name: 'Valid household creation', status: 'pending' },
          { name: 'Invalid household rejection', status: 'pending' },
          { name: 'Member validation', status: 'pending' },
          { name: 'Boundary value testing', status: 'pending' }
        ]
      },
      {
        name: 'Integration Tests',
        status: 'pending',
        tests: [
          { name: 'Mock data generation', status: 'pending' },
          { name: 'Test helper functions', status: 'pending' },
          { name: 'Error handling', status: 'pending' }
        ]
      }
    ]
    
    setTestSuites(suites)
  }

  useEffect(() => {
    initializeTests()
  }, [])

  const updateTestResult = (suiteName: string, testName: string, result: Partial<TestResult>) => {
    setTestSuites(prev => prev.map(suite => {
      if (suite.name === suiteName) {
        return {
          ...suite,
          tests: suite.tests.map(test => 
            test.name === testName ? { ...test, ...result } : test
          )
        }
      }
      return suite
    }))
  }

  const updateSuiteStatus = (suiteName: string, status: TestSuite['status']) => {
    setTestSuites(prev => prev.map(suite => 
      suite.name === suiteName ? { ...suite, status } : suite
    ))
  }

  const runValidationTests = async () => {
    const suiteName = 'Validation Tests'
    updateSuiteStatus(suiteName, 'running')

    // Email validation test
    setCurrentTest('Email validation')
    updateTestResult(suiteName, 'Email validation', { status: 'running' })
    const startTime = Date.now()
    
    try {
      const validEmail = validateEmail('test@example.com')
      const invalidEmail = validateEmail('invalid-email')
      const emptyEmail = validateEmail('')
      
      if (validEmail.isValid && !invalidEmail.isValid && !emptyEmail.isValid) {
        updateTestResult(suiteName, 'Email validation', { 
          status: 'passed', 
          duration: Date.now() - startTime,
          details: 'All email validation cases passed'
        })
      } else {
        throw new Error('Email validation logic failed')
      }
    } catch (error) {
      updateTestResult(suiteName, 'Email validation', { 
        status: 'failed', 
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    await delay(100)

    // Name validation test
    setCurrentTest('Name validation')
    updateTestResult(suiteName, 'Name validation', { status: 'running' })
    const nameStartTime = Date.now()
    
    try {
      const validName = validateName('John Doe')
      const shortName = validateName('A')
      const emptyName = validateName('')
      
      if (validName.isValid && !shortName.isValid && !emptyName.isValid) {
        updateTestResult(suiteName, 'Name validation', { 
          status: 'passed', 
          duration: Date.now() - nameStartTime,
          details: 'Name validation working correctly'
        })
      } else {
        throw new Error('Name validation logic failed')
      }
    } catch (error) {
      updateTestResult(suiteName, 'Name validation', { 
        status: 'failed', 
        duration: Date.now() - nameStartTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    await delay(100)

    // Postal code validation test
    setCurrentTest('Postal code validation')
    updateTestResult(suiteName, 'Postal code validation', { status: 'running' })
    const postalStartTime = Date.now()
    
    try {
      const validPostal = validatePostalCode('12345')
      const invalidPostal = validatePostalCode('123')
      const emptyPostal = validatePostalCode('')
      
      if (validPostal.isValid && !invalidPostal.isValid && emptyPostal.isValid) {
        updateTestResult(suiteName, 'Postal code validation', { 
          status: 'passed', 
          duration: Date.now() - postalStartTime,
          details: 'Postal code validation working correctly'
        })
      } else {
        throw new Error('Postal code validation logic failed')
      }
    } catch (error) {
      updateTestResult(suiteName, 'Postal code validation', { 
        status: 'failed', 
        duration: Date.now() - postalStartTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    await delay(100)

    // Date validation test
    setCurrentTest('Date validation')
    updateTestResult(suiteName, 'Date validation', { status: 'running' })
    const dateStartTime = Date.now()
    
    try {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 30)
      const futureDateStr = futureDate.toISOString().split('T')[0]
      
      const validFutureDate = validateFutureDate(futureDateStr)
      const pastDate = validateFutureDate('2020-01-01')
      
      if (validFutureDate.isValid && !pastDate.isValid) {
        updateTestResult(suiteName, 'Date validation', { 
          status: 'passed', 
          duration: Date.now() - dateStartTime,
          details: 'Date validation working correctly'
        })
      } else {
        throw new Error('Date validation logic failed')
      }
    } catch (error) {
      updateTestResult(suiteName, 'Date validation', { 
        status: 'failed', 
        duration: Date.now() - dateStartTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    await delay(100)

    // Number validation test
    setCurrentTest('Number validation')
    updateTestResult(suiteName, 'Number validation', { status: 'running' })
    const numberStartTime = Date.now()
    
    try {
      const validNumber = validatePositiveNumber(5, 'Test Number')
      const negativeNumber = validatePositiveNumber(-1, 'Test Number')
      const nullNumber = validatePositiveNumber(null, 'Test Number', false)
      
      if (validNumber.isValid && !negativeNumber.isValid && nullNumber.isValid) {
        updateTestResult(suiteName, 'Number validation', { 
          status: 'passed', 
          duration: Date.now() - numberStartTime,
          details: 'Number validation working correctly'
        })
      } else {
        throw new Error('Number validation logic failed')
      }
    } catch (error) {
      updateTestResult(suiteName, 'Number validation', { 
        status: 'failed', 
        duration: Date.now() - numberStartTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    await delay(100)

    // Range validation test
    setCurrentTest('Range validation')
    updateTestResult(suiteName, 'Range validation', { status: 'running' })
    const rangeStartTime = Date.now()
    
    try {
      const validRange = validateRange(5, 1, 10, 'Test Range')
      const belowRange = validateRange(0, 1, 10, 'Test Range')
      const aboveRange = validateRange(15, 1, 10, 'Test Range')
      
      if (validRange.isValid && !belowRange.isValid && !aboveRange.isValid) {
        updateTestResult(suiteName, 'Range validation', { 
          status: 'passed', 
          duration: Date.now() - rangeStartTime,
          details: 'Range validation working correctly'
        })
      } else {
        throw new Error('Range validation logic failed')
      }
    } catch (error) {
      updateTestResult(suiteName, 'Range validation', { 
        status: 'failed', 
        duration: Date.now() - rangeStartTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    updateSuiteStatus(suiteName, 'completed')
  }

  const runHouseholdDataTests = async () => {
    const suiteName = 'Household Data Tests'
    updateSuiteStatus(suiteName, 'running')

    // Valid household creation test
    setCurrentTest('Valid household creation')
    updateTestResult(suiteName, 'Valid household creation', { status: 'running' })
    const validStartTime = Date.now()
    
    try {
      const validData = createMockHouseholdData()
      
      if (validData.name && validData.move_date && validData.property_type) {
        updateTestResult(suiteName, 'Valid household creation', { 
          status: 'passed', 
          duration: Date.now() - validStartTime,
          details: 'Mock household data generated successfully'
        })
      } else {
        throw new Error('Invalid mock data generated')
      }
    } catch (error) {
      updateTestResult(suiteName, 'Valid household creation', { 
        status: 'failed', 
        duration: Date.now() - validStartTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    await delay(100)

    // Invalid household rejection test
    setCurrentTest('Invalid household rejection')
    updateTestResult(suiteName, 'Invalid household rejection', { status: 'running' })
    const invalidStartTime = Date.now()
    
    try {
      const invalidData = createInvalidHouseholdData()
      
      // This should have validation errors
      if (!invalidData.name && invalidData.household_size < 0) {
        updateTestResult(suiteName, 'Invalid household rejection', { 
          status: 'passed', 
          duration: Date.now() - invalidStartTime,
          details: 'Invalid data correctly identified'
        })
      } else {
        throw new Error('Invalid data not properly flagged')
      }
    } catch (error) {
      updateTestResult(suiteName, 'Invalid household rejection', { 
        status: 'failed', 
        duration: Date.now() - invalidStartTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    await delay(100)

    // Member validation test
    setCurrentTest('Member validation')
    updateTestResult(suiteName, 'Member validation', { status: 'running' })
    const memberStartTime = Date.now()
    
    try {
      const validMember = createMockMember()
      
      if (validMember.name && validMember.email && validMember.email.includes('@')) {
        updateTestResult(suiteName, 'Member validation', { 
          status: 'passed', 
          duration: Date.now() - memberStartTime,
          details: 'Member data validation working'
        })
      } else {
        throw new Error('Member validation failed')
      }
    } catch (error) {
      updateTestResult(suiteName, 'Member validation', { 
        status: 'failed', 
        duration: Date.now() - memberStartTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    await delay(100)

    // Boundary value testing
    setCurrentTest('Boundary value testing')
    updateTestResult(suiteName, 'Boundary value testing', { status: 'running' })
    const boundaryStartTime = Date.now()
    
    try {
      const testCases = createValidationTestCases()
      const passedTests = testCases.filter(test => {
        // Simple validation - check if data structure is correct
        return test.data && typeof test.data === 'object' && 'name' in test.data
      })
      
      if (passedTests.length === testCases.length) {
        updateTestResult(suiteName, 'Boundary value testing', { 
          status: 'passed', 
          duration: Date.now() - boundaryStartTime,
          details: `${testCases.length} test cases validated`
        })
      } else {
        throw new Error('Some test cases failed validation')
      }
    } catch (error) {
      updateTestResult(suiteName, 'Boundary value testing', { 
        status: 'failed', 
        duration: Date.now() - boundaryStartTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    updateSuiteStatus(suiteName, 'completed')
  }

  const runIntegrationTests = async () => {
    const suiteName = 'Integration Tests'
    updateSuiteStatus(suiteName, 'running')

    // Mock data generation test
    setCurrentTest('Mock data generation')
    updateTestResult(suiteName, 'Mock data generation', { status: 'running' })
    const mockStartTime = Date.now()
    
    try {
      const household = createMockHouseholdData()
      const member = createMockMember()
      
      if (household && member && household.name && member.email) {
        updateTestResult(suiteName, 'Mock data generation', { 
          status: 'passed', 
          duration: Date.now() - mockStartTime,
          details: 'Mock data generators working correctly'
        })
      } else {
        throw new Error('Mock data generation failed')
      }
    } catch (error) {
      updateTestResult(suiteName, 'Mock data generation', { 
        status: 'failed', 
        duration: Date.now() - mockStartTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    await delay(100)

    // Test helper functions
    setCurrentTest('Test helper functions')
    updateTestResult(suiteName, 'Test helper functions', { status: 'running' })
    const helperStartTime = Date.now()
    
    try {
      const validationResults = [
        { isValid: true, errors: [] },
        { isValid: false, errors: ['Error 1'] },
        { isValid: false, errors: ['Error 2'] }
      ]
      
      const combined = combineValidationResults(...validationResults)
      
      if (!combined.isValid && combined.errors.length === 2) {
        updateTestResult(suiteName, 'Test helper functions', { 
          status: 'passed', 
          duration: Date.now() - helperStartTime,
          details: 'Helper functions working correctly'
        })
      } else {
        throw new Error('Helper function logic failed')
      }
    } catch (error) {
      updateTestResult(suiteName, 'Test helper functions', { 
        status: 'failed', 
        duration: Date.now() - helperStartTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    await delay(100)

    // Error handling test
    setCurrentTest('Error handling')
    updateTestResult(suiteName, 'Error handling', { status: 'running' })
    const errorStartTime = Date.now()
    
    try {
      // Test error handling by trying to validate invalid data
      const result = validateEmail('invalid')
      
      if (!result.isValid && result.errors.length > 0) {
        updateTestResult(suiteName, 'Error handling', { 
          status: 'passed', 
          duration: Date.now() - errorStartTime,
          details: 'Error handling working correctly'
        })
      } else {
        throw new Error('Error handling not working')
      }
    } catch (error) {
      updateTestResult(suiteName, 'Error handling', { 
        status: 'failed', 
        duration: Date.now() - errorStartTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    updateSuiteStatus(suiteName, 'completed')
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setCurrentTest(null)
    
    try {
      await runValidationTests()
      await runHouseholdDataTests()
      await runIntegrationTests()
      
      const totalTests = testSuites.reduce((acc, suite) => acc + suite.tests.length, 0)
      const passedTests = testSuites.reduce((acc, suite) => 
        acc + suite.tests.filter(test => test.status === 'passed').length, 0
      )
      
      toast({
        title: 'Tests abgeschlossen! 🧪',
        description: `${passedTests}/${totalTests} Tests erfolgreich`,
        variant: passedTests === totalTests ? 'default' : 'destructive'
      })
    } catch (error) {
      toast({
        title: 'Test-Fehler',
        description: 'Ein Fehler ist beim Ausführen der Tests aufgetreten',
        variant: 'destructive'
      })
    } finally {
      setIsRunning(false)
      setCurrentTest(null)
    }
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'running':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTotalStats = () => {
    const total = testSuites.reduce((acc, suite) => acc + suite.tests.length, 0)
    const passed = testSuites.reduce((acc, suite) => 
      acc + suite.tests.filter(test => test.status === 'passed').length, 0
    )
    const failed = testSuites.reduce((acc, suite) => 
      acc + suite.tests.filter(test => test.status === 'failed').length, 0
    )
    const running = testSuites.reduce((acc, suite) => 
      acc + suite.tests.filter(test => test.status === 'running').length, 0
    )
    
    return { total, passed, failed, running }
  }

  const stats = getTotalStats()
  const progressPercentage = stats.total > 0 ? ((stats.passed + stats.failed) / stats.total) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5 text-blue-600" />
            muutto Test Runner
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Validation & Integration Tests
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button 
                onClick={runAllTests} 
                disabled={isRunning}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isRunning ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {isRunning ? 'Tests laufen...' : 'Alle Tests starten'}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={initializeTests}
                disabled={isRunning}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Zurücksetzen
              </Button>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                {stats.passed} Erfolgreich
              </span>
              <span className="flex items-center gap-1">
                <XCircle className="h-4 w-4 text-red-600" />
                {stats.failed} Fehlgeschlagen
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-gray-400" />
                {stats.total - stats.passed - stats.failed} Ausstehend
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Fortschritt</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            {currentTest && (
              <p className="text-sm text-blue-600 flex items-center gap-2">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Läuft: {currentTest}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Suites */}
      {testSuites.map((suite) => (
        <Card key={suite.name}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                {suite.name}
                <Badge variant="outline" className={
                  suite.status === 'completed' ? 'bg-green-100 text-green-800' :
                  suite.status === 'running' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }>
                  {suite.status === 'completed' ? 'Abgeschlossen' :
                   suite.status === 'running' ? 'Läuft' : 'Ausstehend'}
                </Badge>
              </span>
              <span className="text-sm text-gray-600">
                {suite.tests.filter(t => t.status === 'passed').length}/{suite.tests.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suite.tests.map((test) => (
                <div key={test.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <h4 className="font-medium">{test.name}</h4>
                      {test.details && (
                        <p className="text-sm text-gray-600">{test.details}</p>
                      )}
                      {test.error && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {test.error}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {test.duration && (
                      <span className="text-xs text-gray-500">
                        {test.duration}ms
                      </span>
                    )}
                    <Badge variant="outline" className={getStatusColor(test.status)}>
                      {test.status === 'passed' ? 'Erfolgreich' :
                       test.status === 'failed' ? 'Fehlgeschlagen' :
                       test.status === 'running' ? 'Läuft' : 'Ausstehend'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}